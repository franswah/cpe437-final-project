var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({ caseSensitive: true });
var async = require('async');
var utils = require('../Utils.js');

router.baseURL = '/Items';

router.get('/', function (req, res) {
   var vld = req.validator;
   var dist = req.query.radius;
   var title = req.query.title;

   req.cnn.query('select i.id, title, price, ownerId, zip, latitude, longitude,' +
    ' postTime, email, imageUrl from Item i join User u on ownerId = u.id',
      function (err, itemArr) {
         utils.appendDistance(itemArr, req.session);

         if (dist) {
            itemArr = utils.cutoffDistance(itemArr, dist);
         }

         res.json(itemArr);
         req.cnn.release();
      });
});

router.get('/:itemId', function (req, res) {
   var vld = req.validator;
   var dist = req.query.radius;
   var title = req.query.title;

   

   req.cnn.query('select i.id, title, price, ownerId, zip, latitude,' +
   ' longitude, description, categoryId,' +
    ' postTime, email, imageUrl from Item i join User u on ownerId = u.id' +
    ' where i.id = ?', [req.params.itemId],
      function (err, itemArr) {
         if (vld.check(itemArr.length, Tags.notFound)) {
            utils.appendDistance(itemArr, req.session);

            res.json(itemArr[0]);
         }
         req.cnn.release();
      });
});

router.put('/:itemId', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var itemId = req.params.itemId;

   async.waterfall([
   function (cb) {
      if (vld.hasOnlyFields(body, ["title", "description", "price"], cb)) {
         cnn.chkQry('select * from Item where id = ?', [itemId], cb);
      }
   },
   function (result, fields, cb) {
      if (vld.check(result.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(result[0].ownerId, cb))
         cnn.chkQry("update Item set ? where id = ?", 
          [body, itemId], cb);
   },
   function (result, fields, cb) {
      res.status(200).end();
      cb();
   }],
   function () {
      cnn.release();
   });
});

router.delete('/:itemId', function (req, res) {
   var vld = req.validator;
   var itemId = req.params.itemId;
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      cnn.chkQry('select * from Item where id = ?', [itemId], cb);
   },
   function (result, fields, cb) {
      if (vld.check(result.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(result[0].ownerId, cb))
         cnn.chkQry('delete from Item where id = ?', [itemId], cb);
   }],
   function (err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });
});

module.exports = router;