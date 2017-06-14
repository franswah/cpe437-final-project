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
   // distance for all items. SSorts the list by distance as well.
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

      if (!useFirst) {
         itemArr.sort(function(a, b) {
            return a.distance - b.distance;
         });
      }
   },

   // Performs binary search on sorted array of objects with distance
   cutoffDistance: function(itemArr, maxDistance) {
      var start = 0;
      var end = itemArr.length - 1;
      var mid = (start + end) / 2;

      while (start < end) {
         if (itemArr[mid].distance > maxDistance) {
            end = mid - 1;
         } 
         else if (itemArr[mid].distance < maxDistance) {
            start = mid + 1;
         }
         mid = (start + end) / 2;
      }

      if (itemArr[mid].distance > maxDistance) {
         return itemArr.slice(0, mid);
      }
      else {
         return itemArr.slice(0, mid+1);
      }
   },

   findZipLatLng: function(zipObject, cb) {
      geo.find(zipObject.zip, cb);
   }
};

module.exports = utils;