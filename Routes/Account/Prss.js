var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Prss';


/* Much nicer versions */
router.get('/', function(req, res) {
   var admin = req.session.isAdmin();
   var email = req.query.email;

   var handler = function(err, prsArr) {
      res.json(prsArr);
      req.cnn.release();
   };

   if (email) {
      if (admin)
         req.cnn.chkQry('select id, email from Person where email like ?',
          [email + '%'],
          handler);
      else if (req.session.email.toLowerCase().startsWith(email.toLowerCase()))
         req.cnn.chkQry('select id, email from Person where id = ?',
          [req.session.id], handler);
      else
         handler(null, []);
   }    
   else if (admin)
      req.cnn.chkQry('select id, email from Person', handler);
   else
      req.cnn.chkQry('select id, email from Person where id = ?',
       [req.session.id], handler);
});

router.post('/', function(req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

   if (admin && !body.password)
      body.password = "*";                       // Blocking password
   body.whenRegistered = new Date();

   async.waterfall([
   function(cb) { // Check properties and search for Email duplicates
      if (vld.hasFields(body, ["email", "lastName", "password", "role"], cb) &&
       vld.chain(body.role === 0 || admin, Tags.noPermission)
       .chain(body.termsAccepted || admin, Tags.noTerms)
       .check(body.role >= 0 && body.role <= 1, Tags.badValue, ["role"], cb)) {
         cnn.chkQry('select * from Person where email = ?', body.email, cb);
      }
   },
   function(existingPrss, fields, cb) {  // If no duplicates, insert new Person
      if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
         body.termsAccepted = body.termsAccepted && new Date();
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },
   function(result, fields, cb) { // Return location of inserted Person
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});


router.get('/:id', function(req, res) {
   var vld = req.validator;

   if (vld.checkPrsOK(req.params.id)) {
      req.cnn.query('select id, firstName, lastName, email, whenRegistered, ' +
       'termsAccepted, role from Person where id = ?', [req.params.id],
      function(err, prsArr) {
         if (vld.check(prsArr.length, Tags.notFound))
            res.json(prsArr);
         req.cnn.release();
      });
   }
   else {
      req.cnn.release();
   }
});

router.put('/:id', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.params.id, cb) &&
       vld.hasOnlyFields(body, 
       ["firstName", "lastName", "password", "oldPassword", "role"])
       .chain(!body.role || admin, Tags.badValue, ["role"])
       .check(body.password === undefined || 
       (!(body.oldPassword === undefined) || admin), 
       Tags.noOldPwd, null, cb)) {
         cnn.chkQry('select * from Person where id = ?',
          [req.params.id], cb);
      }
   },
   function(result, fields, cb) {
      if (vld.check(result.length, Tags.notFound, null, cb) &&
       vld.check(body.password === undefined || 
       body.oldPassword === result[0].password || admin, 
       Tags.oldPwdMismatch, null, cb)) {
         delete body.oldPassword;
         cnn.chkQry('update Person set ? where id = ?',
          [body, req.params.id], cb);
      }
   },
   function(result, fields, cb) {
      res.status(200).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});

router.delete('/:id', function(req, res) {
   var vld = req.validator;

   if (vld.checkAdmin())
      req.cnn.query('DELETE from Person where id = ?', [req.params.id],
      function (err, result) {
         if (!err && vld.check(result.affectedRows, Tags.notFound))
            res.status(200).end();
         req.cnn.release();
      });
   else {
      req.cnn.release();
   }
});

module.exports = router;
