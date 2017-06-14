app.controller('profileController', ['$scope', '$http', '$uibModal', 'login',
 'notifyDlg', function($scope, $http, $uibM, login, nDlg) {
   $scope.user = $scope.$parent.user;

   $scope.editProfile = function() {
      //Populated with fields from modal dialog
      $scope.newProfileFields = {};
      $scope.dlgTitle = "Edit Profile";

      $uibM.open({
         templateUrl: 'Profile/editProfile.template.html',
         scope: $scope
      }).result
      .then(function(profileChanges) {
         $scope.newProfileFields = profileChanges;
         return $http.put('Users/' + $scope.user.id,
          $scope.newProfileFields);
      })
      .then(function() {
         return $http.get('Users/' + $scope.user.id);
      })
      .then(function(updatedUser) {
         $scope.$parent.user = updatedUser.data[0];
         $scope.user = $scope.$parent.user;
      })
      .catch(function(err) {
         if (err && err.data[0].tag === 'oldPwdMismatch') {
            nDlg.show($scope, "Incorrect old Password - Try Again", "Error");
         }
      })
   }
}]);
