app.controller('itemDetailController',
 ['$rootScope', '$scope', '$state', '$http', '$uibModal',
  '$q', 'notifyDlg', 'item', function($rootScope, $scope,
  $state, $http, $uibM, $q, nDlg, item) {
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

   $scope.delItem = function() {
      nDlg.show($scope,
          "Are you sure you want to delete this item?",
          "Delete Item", ["Yes", "No"])
      .then(function(btn) {
         if (btn === "Yes") {
            return $http.delete("Items/" + $scope.item.id)
         }
         else {
            return $q.reject('No');
         }
      })
      .then(function() {
            $state.go($rootScope.$previousState,
             $rootScope.$previousStateParams);
      })
      .catch(function(err) {
         if (err !== 'No')
         {
            console.log("An error occurred deleting this message");
            console.log(err);
         }
      });
   }
}]);
