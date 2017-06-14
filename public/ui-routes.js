
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
         url: '/Items?radius&title',
         templateUrl: 'Item/itemOverview.template.html',
         controller: 'itemOverviewController',
         resolve: {
            pageTitle: ['$stateParams', function($stateParams) {
               if ($stateParams.title) {
                  return 'Search Results';
               }
               else {
                  return 'All Items';
               }
            }],
            itemsToDisplay: ['$http', '$stateParams',
             function($http, $stateParams) {
                if ($stateParams.title) {
                   if ($stateParams.radius) {
                      return $http.get('/Items?radius=' + $stateParams.radius +
                       '&title=' + $stateParams.title)
                      .then(function(response) {
                         return response.data;
                      });
                   }
                   else {
                      return $http.get('/Items?title=' + $stateParams.title)
                      .then(function(response) {
                         return response.data;
                      });
                   }
                }
                else {
                   return $http.get('/Items')
                   .then(function(response) {
                      return response.data;
                   });
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
      .state('itemsByCategory', {
         url: '/Categories/:id/Items?radius&title',
         templateUrl: 'Item/itemOverview.template.html',
         controller: 'itemOverviewController',
         resolve: {
            pageTitle: ['$http', '$stateParams',
             function($http, $stateParams) {
               return $http.get("Categories")
               .then(function(allCats) {
                  return allCats.data[$stateParams.id].name;
               });
            }],
            itemsToDisplay: ['$http', '$stateParams',
             function($http, $stateParams) {
                if ($stateParams.title) {
                   if ($stateParams.radius) {
                      return $http.get('/Categories/' + $stateParams.id +
                       '/Items?radius=' + $stateParams.radius +
                       '&title=' + $stateParams.title)
                      .then(function(response) {
                         return response.data;
                      });
                   }
                   else {
                      return $http.get('/Categories/' + $stateParams.id +
                       '/Items?title=' + $stateParams.title)
                      .then(function(response) {
                         return response.data;
                      });
                   }
                }
                else {
                   return $http.get('/Categories/' + $stateParams.id +
                    '/Items')
                   .then(function(response) {
                      return response.data;
                   });
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
      .state('myItems', {
         url: '/Users/:id/Items',
         templateUrl: 'Item/itemOverview.template.html',
         controller: 'itemOverviewController',
         resolve: {
            pageTitle: ['$stateParams', function($stateParams) {
               return 'My Items';
            }],
            itemsToDisplay: ['$http', '$stateParams',
             function($http, $stateParams) {
               return $http.get('Users/' + $stateParams.id + '/Items')
               .then(function(resp) {
                  return resp.data;
               })
               .catch(function(err) {
                  console.log(err);
               });
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
