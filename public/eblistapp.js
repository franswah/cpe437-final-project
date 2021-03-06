
var app = angular.module('mainApp', [
   'ui.router',
   'ui.bootstrap'
]).run(function($rootScope, $http) {
   $rootScope.categories = {};

   //Track the previous state for transitioning back
   $rootScope.$on('$stateChangeSuccess',
    function(event, to, toParams, from, fromParams) {
      $rootScope.$previousState = from;
      $rootScope.$previousStateParams = fromParams;
      $rootScope.$currentState = to;
      $rootScope.$currentStateParams = toParams;
   });

   $http.get("Categories")
   .then(function(resp) {
      $rootScope.categories = resp.data;
   });
});

app.constant("errMap", {
   en: {
      missingField: 'Field missing from request: ',
      badValue: 'Field has bad value: ',
      notFound: 'Entity not present in DB',
      badLogin: 'Email/password combination invalid',
      dupEmail: 'Email duplicates an existing email',
      noTerms: 'Acceptance of terms is required',
      forbiddenRole: 'Role specified is not permitted.',
      noOldPwd: 'Change of password requires an old password',
      oldPwdMismatch: 'Old password that was provided is incorrect.',
      dupTitle: 'Conversation title duplicates an existing one',
      dupEnrollment: 'Duplicate enrollment',
      forbiddenField: 'Field in body not allowed.',
      queryFailed: 'Query failed (server problem).'
   },
   es: {
      missingField: '[ES] Field missing from request: ',
      badValue: '[ES] Field has bad value: ',
      notFound: '[ES] Entity not present in DB',
      badLogin: '[ES] Email/password combination invalid',
      dupEmail: '[ES] Email duplicates an existing email',
      noTerms: '[ES] Acceptance of terms is required',
      forbiddenRole: '[ES] Role specified is not permitted.',
      noOldPwd: '[ES] Change of password requires an old password',
      oldPwdMismatch: '[ES] Old password that was provided is incorrect.',
      dupTitle: '[ES] Conversation title duplicates an existing one',
      dupEnrollment: '[ES] Duplicate enrollment',
      forbiddenField: '[ES] Field in body not allowed.',
      queryFailed: '[ES] Query failed (server problem).'
   }
   
});

app.filter('tagError', ['$rootScope', 'errMap', 
 function($rootScope, errMap) {
   return function(err) {
      return errMap[$rootScope.selectedLang.tag][err.tag] + 
       (err.params && err.params.length ?
       err.params[0] : "");
   };
}]);

app.directive('itemListing', [function() {
   return {
      restrict: 'E',
      transclude: true,
      scope: {
         item: "=item",
      },

      templateUrl: 'Item/itemLine.template.html'
   };
}]);

app.directive('fileModel', ['$parse', function ($parse) {
   return {
      restrict: 'A',
      link: function(scope, element, attrs) {
         var model = $parse(attrs.fileModel);
         var modelSetter = model.assign;

         element.bind('change', function() {
            scope.$apply(function() {
               modelSetter(scope.$parent, element[0].files[0]);
            });
         });
      }
   };
}]);

app.run(['$rootScope', function($rootScope) {
   $rootScope.languages = [{
      tag: 'en',
      en: 'English',
      es: 'Ingles'
   },
   {
      tag: 'es',
      en: 'Spanish',
      es: 'Espanol'
   }
   ]

   $rootScope.selectedLang = $rootScope.languages[0];
}])
