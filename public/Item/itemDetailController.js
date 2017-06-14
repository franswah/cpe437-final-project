app.controller('itemDetailController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'item',
 function($scope, $state, $http, $uibM, nDlg, item) {
   $scope.item = item;

   $scope.editItem = function() {
      //Populated with title, desc, or price from modal dialog
      $scope.newItemInfo = {};
      $scope.dlgTitle = "Edit Item";
      var postToCategory = -1;

      $uibM.open({
         templateUrl: 'Item/editItemDlg.template.html',
         scope: $scope
      }).result
      .then(function(newItem) {
         //Populate the body of the upcoming post
         $scope.newItemInfo.title = newItem.title;
         $scope.newItemInfo.description = newItem.desc;
         if (newItem.price) {
            $scope.newItemInfo.price = newItem.price * 100;
         }

         return $http.put('Items/' + $scope.item.id,
          $scope.newItemInfo);
      })
      .then(function() {
         if ($scope.itemImage) {
            var fd = new FormData();
            fd.append('file', $scope.itemImage);
            return $http.put('Items/' + $scope.item.id + '/Image', fd, {
               transformRequest: angular.identity,
               headers: {'Content-Type': undefined}
            }).then(function(result) {
               return $http.get('Users/' + $scope.user.id + '/Items');
            });
         }
         else {
            return $http.get('Users/' + $scope.user.id + '/Items');
         }
      })
      .then(function(updatedItem) {
         $scope.item = updatedItem.data;
      })
      .catch(function(err) {
         if (err) {
            nDlg.show($scope, "Failed to update item post", "Error");
         }
      });
   }
}]);
