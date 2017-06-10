app.controller('cnvDetailController',
 ['$scope', '$state', '$http', 'cnv', 'msgs',
 function($scope, $state, $http, cnv, msgs) {

   $scope.cnv = cnv;
   $scope.msgs = msgs;

   $scope.send = function(newContent) {   
      $http.post('Cnvs/' + cnv.id + '/Msgs', {content: newContent})
      .then(function() {
         return $http.get('Cnvs/' + cnv.id + '/Msgs');
      })
      .then(function(rsp) {
         $scope.msgs = rsp.data;
         $scope.content = '';
      })
      .catch(function() {
         nDlg.show($scope, "Message failed to send.",
          "Error");
      });
   }
}]);
