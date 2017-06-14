var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({ caseSensitive: true });
var async = require('async');
var utils = require('../Utils.js');
var fs = require('fs');

router.baseURL = '/Items';

router.get('/', function (req, res) {
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
      ' where title like ?', ['%' + title + '%'],
      handler);
   }
   else {
      req.cnn.query('select i.id, title, price, ownerId, zip, latitude, longitude,' +
      ' postTime, email, imageUrl from Item i join User u on ownerId = u.id',
      handler);
   }
});

router.get('/:itemId', function (req, res) {
   var vld = req.validator;
   var dist = req.query.radius;
   var title = req.query.title;

   async.waterfall([
   function (cb) {
      req.cnn.query('select i.id, title, price, ownerId, zip, latitude,' +
         ' longitude, description, categoryId,' +
         ' postTime, email, imageUrl from Item i join User u on' +
         ' ownerId = u.id where i.id = ?', [req.params.itemId], cb);
   },
   function (itemArr,fields, cb) {
      if (vld.check(itemArr.length, Tags.notFound)) {
         if (req.session) {
            req.cnn.query('select latitude, longitude from User where id = ?',
             [req.session.id], function(err, userArr) {
               utils.appendDistance(itemArr, userArr[0]);
               res.json(itemArr[0]);
               req.cnn.release();
             });
         }
         else {
            res.json(itemArr[0]);
            req.cnn.release();
         }
      }
      else {
         req.cnn.release();
      }
   }
   ])
   
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

router.put('/:itemId/Image', function (req, res) {
   var vld = req.validator;
   var itemId = req.params.itemId;
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      cnn.chkQry('select * from Item where id = ?', [itemId], cb);
   },
   function (result, fields, cb) {
      if (vld.check(req.file && req.file.buffer, Tags.badFile, null, cb) &&
         vld.check(result.length, Tags.notFound, null, cb) &&
         vld.checkPrsOK(result[0].ownerId, cb)) {
         var filePath = __dirname + '/../../public/images/' + itemId + '.jpg';
         fs.writeFile(filePath, req.file.buffer, cb);
      }
   },
   function(cb) {
      cnn.chkQry("update Item set imageUrl = ? where id = ?", 
          ['images/' + itemId + '.jpg', itemId], cb);
   }],
   function (err) {
      if (err) 
         console.log(err);
      res.status(200).end();
      cnn.release();
   })

})

module.exports = router;