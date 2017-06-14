app.controller('itemDetailController',
 ['$scope', '$state', '$http', 'item',
 function($scope, $state, $http, item) {
   $scope.item = item;

   $scope.editItem = function() {
      ;//TBD
   }
}]);
