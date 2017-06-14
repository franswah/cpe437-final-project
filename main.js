var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
var Session = require('./Routes/Session.js');
var Validator = require('./Routes/Validator.js');
var CnnPool = require('./Routes/CnnPool.js');

var maxFileSize = 1000 * 1000 * 10;
var multer = require('multer');
var upload = multer({
   limits: {
      fileSize: maxFileSize
   }
}).single('file');

var async = require('async');

var app = express();

// Static paths to be served like index.html and all client side js
app.use(express.static(path.join(__dirname, 'public')));

// Parse all data request bodies using either JSON or raw bodyparser
app.use(function(req, res, next) {
   if (req.path.endsWith('Image')) {
      upload(req, res, function (err) {
         if (err) {
            res.status(400).json([{tag: Validator.Tags.limitExceeded}]);
         }
         else {
            next();
         }
      });
   }
   else {
      bodyParser.json()(req, res, next);
   }
});


// Attach cookies to req as req.cookies.<cookieName>
app.use(cookieParser());

// Set up Session on req if available
app.use(Session.router);

// Check general login.  If OK, add Validator to |req| and continue processing,
// otherwise respond immediately with 401 and noLogin error tag.
app.use(function (req, res, next) {
   console.log(req.path);
   if (req.session || (req.method === 'POST' &&
    (req.path === '/Users' || req.path === '/Ssns')) ||
    (req.method === 'GET' && 
    (req.path.startsWith('/Categories') || req.path.startsWith('/Items')))) {
      req.validator = new Validator(req, res);
      next();
   } else {
      res.status(401).end();
   }
});

// Add DB connection, with smart chkQry method, to |req|
app.use(CnnPool.router);

// Load all subroutes
app.use('/Users', require('./Routes/Account/Users.js'));
app.use('/Ssns', require('./Routes/Account/Ssns.js'));
app.use('/Items', require('./Routes/Item/Items.js'));
app.use('/Categories', require('./Routes/Item/Categories.js'));

// Special debugging route for /DB DELETE.  Clears all table contents,
//resets all auto_increment keys to start at 1, and reinserts one admin user.
app.delete('/DB', function (req, res) {

   var cbs = [];

   cbs.push(function (cb) {
      if (req.validator.checkAdmin(cb)) {
         cb();
      }
   });

   // Callbacks to clear tables
   cbs = cbs.concat(["Item", "User"].map(function (tblName) {
      return function (cb) {
         req.cnn.query("delete from " + tblName, cb);
      };
   }));

   // Callbacks to reset increment bases
   cbs = cbs.concat(["Item", "User"].map(function (tblName) {
      return function (cb) {
         req.cnn.query("alter table " + tblName + " auto_increment = 1", cb);
      };
   }));

   // Callback to reinsert admin user
   cbs.push(function (cb) {
      req.cnn.query('INSERT INTO User (firstName, lastName, email,' +
       ' password, whenRegistered, role, zip, latitude, longitude) VALUES' +
       ' ("Joe", "Admin", "adm@11.com","password", NOW(), 1, "93401", ' +
       ' 35.2454989, -120.5969758);', cb);
   });

   // Callback to clear sessions, release connection and return result
   cbs.push(function (callback) {
      for (var session in Session.sessions)
         delete Session.sessions[session];
      callback();
   });

   async.series(cbs, function (err) {
      req.cnn.release();
      res.status(200).end();
   });
});

// Handler of last resort.  Print a stacktrace to console and send a 500 response.
app.use(function (req, res, next) {
   res.status(404).end();
   req.cnn.release();
});

var PORT = 3006;

for (var i = 0; i < process.argv.length; i++) {
   if (process.argv[i] === "-p" && ++i < process.argv.length) {
      PORT = process.argv[i];
   }
}

app.listen(PORT, function () {
   console.log('App Listening on port ' + PORT);
});
