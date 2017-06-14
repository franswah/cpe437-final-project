var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({ caseSensitive: true });
var async = require('async');
var utils = require('../Utils.js');

router.baseURL = '/Categories';

var TITLE_MAX = 255;
var DESCRIPTION_MAX = 3000;

router.get('/', function (req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   var handler = function (err, catArr) {
      res.json(catArr);
      req.cnn.release();
   };

   req.cnn.chkQry('select * from Category', handler);
});

router.get('/:id/Items', function (req, res) {
   var vld = req.validator;
   var dist = req.query.radius;
   var title = req.query.title;

   var handler = function(err, itemArr) {
      if (req.session) {
         req.cnn.query('select latitude, longitude from User where id = ?',
            [req.session.id], function(err, userArr) {
            utils.appendDistance(itemArr, userArr[0]);

            if (dist) {
               itemArr = utils.cutoffDistance(itemArr, dist);
            }

            res.json(itemArr);
            req.cnn.release();
         });
      }
      else {
         res.json(itemArr);
         req.cnn.release();
      }
   };

   if (title) {
      req.cnn.query('select i.id, title, price, ownerId, zip, latitude, longitude,' +
      ' postTime, email, imageUrl from Item i join User u on ownerId = u.id' +
      ' where categoryId = ? and title like ?', [req.params.id, '%' + title + '%'],
      handler);
   }
   else {
      req.cnn.query('select i.id, title, price, ownerId, zip, latitude, longitude,' +
      ' postTime, email, imageUrl from Item i join User u on ownerId = u.id' +
      ' where categoryId = ?', [req.params.id],
      handler);
   }
});

router.post('/:id/Items', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      if (vld.hasFields(body, ["title", "description", "price"], cb) &&
       vld.hasOnlyFields(body, ["title", "description", "price"], cb)
       .chain(body.title.length <= TITLE_MAX, Tags.badValue, ["title"])
       .chain(Number.isInteger(body.price), Tags.badValue, ["price"])
       .check(body.description.length <= DESCRIPTION_MAX, Tags.badValue, ["description"], 
       cb)) {
         cnn.chkQry('select * from Category where id = ?', req.params.id,
          cb);
      }
   },
   function (existingCat, fields, cb) {
      if (vld.check(existingCat.length, Tags.invalidCategory, null, cb)) {
         body.categoryId = parseInt(req.params.id);
         body.ownerId = req.session.id;
         body.postTime = new Date();
         cnn.chkQry("insert into Item set ?", body, cb);
      }
   },
   function (insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }
   ],
   function () {
      cnn.release();
   });
});

module.exports = router;