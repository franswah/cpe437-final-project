app.controller('searchController',
 ['$scope', '$state', '$http', '$httpParamSerializer', 'allCategories',
 function($scope, $state, $http, $httpParamSerializer, allCategories) {
   $scope.allCategories = allCategories;

   $scope.search = function() {
      //If the user is searching in a specific category
      if ($scope.search.category >= 0) {
         $state.go('itemsByCategory', {id: $scope.search.category,
          radius: $scope.search.radius, title: $scope.search.title});
      }
      //Else the user is searching through all items
      else {
         $state.go('items', {radius: $scope.search.radius,
          title: $scope.search.title});
      }
   };
}]);