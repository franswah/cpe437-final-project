
app.config(['$stateProvider', '$urlRouterProvider',
   function($stateProvider, $router) {

      //redirect to home if path is not matched
      $router.otherwise("/");

      $stateProvider
      .state('home',  {
         url: '/',
         templateUrl: 'Home/home.template.html',
         controller: 'homeController',
      })
      .state('login', {
         url: '/login',
         templateUrl: 'Login/login.template.html',
         controller: 'loginController',
      })
      .state('logout', {
         url: '/',
         templateUrl: 'Home/home.template.html',
         controller: 'homeController',
         resolve: {
            logout: ['login', function(login) {
               return login.logout();
            }]
         }
      })
      .state('register', {
         url: '/register',
         templateUrl: 'Register/register.template.html',
         controller: 'registerController',
      })
      .state('profile', {
         url: '/profile',
         templateUrl: 'Profile/profile.template.html',
         controller: 'profileController',

      })
      .state('items', {
         url: '/items',
         params: {
            pageTitle: 'Items',
            getItemsUrl: 'Items',
            getItemsParams: undefined
         },
         templateUrl: 'Item/itemOverview.template.html',
         controller: 'itemOverviewController',
         resolve: {
            pageTitle: ['$stateParams', function($stateParams) {
               return $stateParams.pageTitle;
            }],
            itemsToDisplay: ['$http', '$stateParams',
             function($http, $stateParams) {
                if ($stateParams.getItemsParams) {
                   return $http.get($stateParams.getItemsUrl + '?' +
                    $stateParams.getItemsParams)
                   .then(function(resp) {
                      delete $stateParams.getItemsParams;
                      return resp.data;
                   })
                   .catch(function(err) {
                      console.log(err);
                   })
                }
                else {
                   return $http.get($stateParams.getItemsUrl)
                   .then(function(resp) {
                      return resp.data;
                   })
                   .catch(function(err) {
                      console.log(err);
                   })
                }
            }],
            allCategories: ['$http', function($http) {
               return $http.get("Categories")
               .then(function(resp) {
                  return resp.data;
               });
            }]
         }
      })
      .state('itemDetail', {
         url: '/Items/:id',
         templateUrl: 'Item/itemDetail.template.html',
         controller: 'itemDetailController',
         resolve: {
            item: ['$q', '$http', '$stateParams',
             function($q, $http, $stateParams) {
               return $http.get('/Items/' + $stateParams.id)
               .then(function(response) {
                  return response.data;
               });
            }]
         }
      })
      .state('search', {
         url: '/search',
         templateUrl: 'Search/search.template.html',
         controller: 'searchController',
         resolve: {
            allCategories: ['$http', function($http) {
               return $http.get("Categories")
               .then(function(resp) {
                  return resp.data;
               });
            }]
         }
      });
   }]);
