app.controller('profileController', ['$scope', '$http', '$uibModal', 'login',
   'notifyDlg', function($scope, $http, $uibM, login, nDlg) {
   $scope.user = login.getUser();
   $scope.edit = {};
   $scope.pass = {};

   $scope.makeEdits = function() {
     nDlg.show($scope, "Are you sure you want to Edit? ",
         "Make Edit", ["Yes", "No"])
     .then(function(btn) {
        if(btn == "Yes")
           $http.put("Users/" + $scope.user.id, $scope.edit)
     })
      .then(function() {
         if($scope.edit.firstName)
            $scope.user.firstName = $scope.edit.firstName;
         if($scope.edit.lastName)
            $scope.user.lastName = $scope.edit.lastName;
         if($scope.edit.zip)
            $scope.user.zip = $scope.edit.zip
      })
      .catch(function(err) {
         console.log(err);
         nDlg.show($scope, "Error editing selected field");
      })
   };
   $scope.changePass = function() {
      $uibM.open({
         templateUrl: 'Profile/changePass.template.html',
         scope: $scope
      }).result
      .then(function(pass) {
         $http.put("Users/" + $scope.user.id, pass)
      })
      .then(function() {
         nDlg.show($scope, "Password Changed",
            "Success")
      })
      .catch(function(err) {
         console.log(err)
         nDlg.show($scope, "Password Changed Failed",
            "Failed")
      })
   }
}]);
