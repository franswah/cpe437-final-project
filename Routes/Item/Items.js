var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({ caseSensitive: true });
var async = require('async');
var geolib = require('geolib');

router.baseURL = '/Items';

router.get('/', function (req, res) {
   var vld = req.validator;
   var dist = req.query.radius;
   var title = req.query.title;

   req.cnn.query('select i.id, title, price, ownerId, zip, latitude, longitude,' +
    ' postTime, email, imageUrl from Item i join User u on ownerId = u.id',
      function (err, itemArr) {
         var distance;

         itemArr.forEach(function(item) {
            distance = geolib.getDistanceSimple(req.session, item);
            item.distance = distance / 1609.34;
            delete item.longitude;
            delete item.latitude;
         });

         res.json(itemArr);
         req.cnn.release();
      });
});

router.get('/:id', function (req, res) {
   var vld = req.validator;
   var dist = req.query.radius;
   var title = req.query.title;

   req.cnn.query('select i.id, title, price, ownerId, zip, latitude,' +
   ' longitude, description, categoryId,' +
    ' postTime, email, imageUrl from Item i join User u on ownerId = u.id' +
    ' where i.id = ?', [req.params.id],
      function (err, itemArr) {
         if (vld.check(itemArr.length, Tags.notFound)) {
            var item = itemArr[0];
            var distance = geolib.getDistanceSimple(req.session, item);
            item.distance = distance / 1609.34;
            delete item.longitude;
            delete item.latitude;

            res.json(item);
            req.cnn.release();
         }
         
      });
});


module.exports = router;