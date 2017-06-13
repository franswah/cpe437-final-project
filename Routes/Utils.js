var geolib = require('geolib');
var geocoder = require('google-geocoder');

var geo = geocoder({
   key: 'AIzaSyDaPSxeHsiKl8wz-pgnyJLmKbwyhgV1gkw'
});

var utils = {

   METERS_PER_MILE: 1609.34,

   // Appends distance field to each item in the array based off of
   // it's distance from refObject. If useFirst is true, then only
   // find the distance of the first item and insert that as the 
   // distance for all items
   appendDistance: function(itemArr, refObject, useFirst) {
      var that = this;
      var distance;
      

      if (useFirst && itemArr.length > 0) {
         distance = geolib.getDistanceSimple(refObject, itemArr[0]);
         distance = distance / this.METERS_PER_MILE;
      }

      itemArr.forEach(function(item) {
         if (!useFirst) {
            distance = geolib.getDistanceSimple(refObject, item) /
             that.METERS_PER_MILE;
         }

         item.distance = distance;
         delete item.longitude;
         delete item.latitude;
      });
   },

   findZipLatLng: function(zipObject, cb) {
      geo.find(zipObject.zip, cb);
   }
};

module.exports = utils;