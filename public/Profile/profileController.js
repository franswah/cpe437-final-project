app.controller('homeController', ['$scope', 'login', function($scope, login) {
   $scope.$parent.user = login.getUser();
}]);
