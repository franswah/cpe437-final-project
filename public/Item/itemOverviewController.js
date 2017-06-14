app.controller('itemOverviewController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg',
 'pageTitle', 'itemsToDisplay', 'allCategories',
 function($scope, $state, $http, $uibM, nDlg, pageTitle,
 itemsToDisplay, allCategories) {
   //Injected from stateParams being passed through resolve in ui-router
   $scope.pageTitle = pageTitle;
   $scope.itemsToDisplay = itemsToDisplay;
   $scope.allCategories = allCategories;

   $scope.newItem = function() {
      //Populated with title, desc, price, and cat from modal dialog
      $scope.newItemInfo = {};
      $scope.dlgTitle = "New Item";
      var postToCategory = -1;

      $uibM.open({
         templateUrl: 'Item/editItemDlg.template.html',
         scope: $scope
      }).result
      .then(function(newItem) {
         //Retrieve the category to post the new item to
         postToCategory = newItem.cat;
         //Populate the body of the upcoming post
         $scope.newItemInfo.title = newItem.title;
         $scope.newItemInfo.description = newItem.desc;
         $scope.newItemInfo.price = newItem.price * 100;

         return $http.post("Categories/" + postToCategory + "/Items",
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
         $scope.pageTitle = 'My Items';
      })
      .catch(function(err) {
         console.log("Failed to post new item: " + JSON.stringify(err));
         /*if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another conversation already has title " +
             selectedTitle,
             "Error");*/
      });
   }

    //EVERYTHING BELOW HERE IS OLD CHS CODE FOR REFERENCE, REMOVE WHEN DONE

   /*var filterCnvs;

   if ($state.current.url === "/cnvs/mine") {
      $scope.mine = true;

      filterCnvs = function(cnvs) {
         return cnvs.filter(function(cnv) {
            return cnv.ownerId === $scope.user.id;
         })
      }
   }
   else {
      filterCnvs = function(cnvs) {
         return cnvs;
      }
   }

   $scope.cnvs = filterCnvs(cnvs);

   $scope.newCnv = function() {
      $scope.title = null;
      $scope.dlgTitle = "New Conversation";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Conversation/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         selectedTitle = newTitle;
         return $http.post("Cnvs", {title: newTitle});
      })
      .then(function() {
         return $http.get('/Cnvs');
      })
      .then(function(rsp) {
         $scope.cnvs = filterCnvs(rsp.data);
      })
      .catch(function(err) {
         // console.log("Error: " + JSON.stringify(err));
         if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another conversation already has title " +
             selectedTitle,
             "Error");
      });
   };

   $scope.editCnv = function(index) {
      $scope.dlgTitle = "Edit Conversation Title";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Conversation/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         selectedTitle = newTitle;
         return $http.put("Cnvs/" + $scope.cnvs[index].id, {title: newTitle});
      })
      .then(function() {
         return $http.get('/Cnvs');
      })
      .then(function(rsp) {
         $scope.cnvs = filterCnvs(rsp.data);
      })
      .catch(function(err) {
         if (err.data[0].tag == "dupTitle")
         nDlg.show($scope, "Another conversation already has title " +
          selectedTitle,
          "Error");
      });
   };

   $scope.delCnv = function(index) {
      nDlg.show($scope, "Delete Conversation " +
       $scope.cnvs[index].title + "?",
       "Delete Conversation", ["Yes", "No"])
      .then(function(btn) {
         if (btn == "Yes") {
            return $http.delete("Cnvs/" + $scope.cnvs[index].id);
         }
      })
      .then(function() {
         return $http.get('/Cnvs');
      })
      .then(function(rsp) {
         $scope.cnvs = filterCnvs(rsp.data);
      })
   };*/
}]);
