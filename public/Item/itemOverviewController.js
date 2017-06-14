app.controller('itemOverviewController',
 ['$rootScope', '$scope', '$state', '$http', '$uibModal', 'notifyDlg',
 'pageTitle', 'itemsToDisplay', 'allCategories',
 function($rootScope, $scope, $state, $http, $uibM, nDlg, pageTitle,
 itemsToDisplay, allCategories) {
   //Injected from stateParams being passed through resolve in ui-router
   $scope.pageTitle = pageTitle;
   $scope.itemsToDisplay = itemsToDisplay;
   $scope.allCategories = allCategories;

   $scope.newItem = function() {
      //Populated with title, desc, price, and cat from modal dialog
      $scope.newItemInfo = {};
      $scope.dlgTitle = "New Item";
      $scope.postToCategory = -1;

      if ($rootScope.$currentState.name === "itemsByCategory")
      {
         $scope.postToCategory = $rootScope.$currentStateParams.id;
      }

      $uibM.open({
         templateUrl: 'Item/newItemDlg.template.html',
         scope: $scope
      }).result
      .then(function(newItem) {
         //Retrieve the category to post the new item to
         if (newItem.cat >= 0) {
            $scope.postToCategory = newItem.cat;
         }
      
         //Populate the body of the upcoming post
         $scope.newItemInfo.title = newItem.title;
         $scope.newItemInfo.description = newItem.desc;
         $scope.newItemInfo.price = newItem.price * 100;

         return $http.post("Categories/" + $scope.postToCategory + "/Items",
          $scope.newItemInfo);
      })
      .then(function(result) {
         var locationArr = result.headers('Location').split('/');
         var itemId = locationArr[locationArr.length-1];
         if ($scope.itemImage) {
            var fd = new FormData();
            fd.append('file', $scope.itemImage);
            return $http.put('Items/' + itemId + '/Image', fd, {
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
      .then(function(myItems) {
         $scope.itemsToDisplay = myItems.data;
         $state.reload();
      })
      .catch(function(err) {
         console.log("Failed to post new item: " + JSON.stringify(err));
         /*if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another conversation already has title " +
             selectedTitle,
             "Error");*/
      });
   }
}]);
