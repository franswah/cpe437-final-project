app.controller('searchController',
 ['$scope', '$state', '$http', '$httpParamSerializer', 'allCategories',
 function($scope, $state, $http, $httpParamSerializer, allCategories) {
   $scope.allCategories = allCategories;

   $scope.search = function() {
      //If the user is searching in a specific category
      if ($scope.search.category >= 0) {
         $state.go('items', {pageTitle: 'Search Results',
          getItemsUrl: 'Categories/' + $scope.search.category + '/Items',
          getItemsParams: $httpParamSerializer({radius: $scope.search.radius,
          title: $scope.search.title})});
      }
      //Else the user is searching through all items
      else {
         $state.go('items', {pageTitle: 'Search Results',
          getItemsUrl: 'Items',
          getItemsParams: $httpParamSerializer({radius: $scope.search.radius,
          title: $scope.search.title})});
      }
   };
}]);