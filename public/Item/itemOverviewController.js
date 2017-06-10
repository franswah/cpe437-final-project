app.controller('cnvOverviewController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'cnvs',
 function($scope, $state, $http, $uibM, nDlg, cnvs) {
   var filterCnvs;

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
   };
}]);
