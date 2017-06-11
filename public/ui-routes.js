
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
                   $http.get($stateParams.getItemsUrl + '?' +
                    $stateParams.getItemsParams)
                   .then(function(resp) {
                      $stateParams.getItemsParams = undefined;
                      return resp.data;
                   })
                   .catch(function(err) {
                      console.log(err);
                   })
                }
                else {
                   $http.get($stateParams.getItemsUrl)
                   .then(function(resp) {
                      return resp.data;
                   })
                   .catch(function(err) {
                      console.log(err);
                   })
                }
            }]
         }
      })
      .state('search', {
         url: '/search',
         templateUrl: 'Search/search.template.html',
         controller: 'searchController',
         resolve: {
            allCategories: ['$http', function($http) {
               $http.get("Categories")
               .then(function(resp) {
                  return resp.data;
               });
            }]
         }
      });
   }]);
