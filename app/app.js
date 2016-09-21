'use strict';

let app = angular.module('MyApp', ['ngRoute', 'ui.bootstrap', 'multipleSelect', 'xeditable', 'angularSpinner'])
          .constant('FirebaseURL', 'https://wildtree-app.firebaseio.com/');

app.config(($routeProvider)=> {
  $routeProvider
  .when('/', {
    templateUrl: 'partials/login.html',
    controller: 'LoginCtrl',
  })
  .when('/login', {
    templateUrl: 'partials/login.html',
    controller: 'LoginCtrl',
  })
  .when('/workshops', {
    templateUrl: 'partials/workshops.html',
    controller: 'WorkshopCtrl',
    rep: true
  })
  .when('/workshops/:workshopId', {
    templateUrl: 'partials/workshopsingle.html',
    controller: 'WorkshopSingleCtrl',
    rep: true
  })
  .when('/butcher', {
    templateUrl: 'partials/butchermain.html',
    controller: 'ButcherMainCtrl',
    butcher: true
  })
  .when('/butcher/:orderId', {
    templateUrl: 'partials/butcherorder.html',
    controller: 'ButcherOrderCtrl',
    butcher: true
  })
  .otherwise('/login');
});

app.run((FbCreds, editableOptions, editableThemes)=> {
  firebase.initializeApp(FbCreds);
  editableOptions.theme = 'bs3';
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-sm';
});

app.run(($rootScope, $location, UserFactory, AuthFactory)=> {
  $rootScope.$on('$routeChangeStart', function(event, next, current){
    UserFactory.getUser(AuthFactory.getUserId())
    .then((user)=> {
      //seems to work faster than reject() in getUser followed by catch()
      if(!user){
        console.info('no access..not logged in');
        $location.path('/login');
      }

      if(next.$$route.butcher){
        if(user && !user.isButcher){$location.path('/workshops');}
      }
      if(next.$$route.rep){
        if(user && user.isButcher){$location.path('/butcher');}
      }
    });
  });
});
