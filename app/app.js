'use strict';

let app = angular.module('MyApp', ['ngRoute', 'ui.bootstrap', 'multipleSelect', 'xeditable', 'angularSpinner'])
          .constant('FirebaseURL', 'https://wildtree-app.firebaseio.com/');

const isAuth = (AuthFactory)=> new Promise((resolve, reject)=>{
  // This will be a boolean and it will resolve if its true, meaning you can access the URLs below
  if(AuthFactory.isAuthenticated()){
    resolve();
  } else {
    reject();
  }
});

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
    resolve: {
      isAuth
    }
  })
  .when('/workshops/:workshopId', {
    templateUrl: 'partials/workshopsingle.html',
    controller: 'WorkshopSingleCtrl',
    resolve: {
      isAuth
    }
  });
});

app.run((FbCreds, editableOptions, editableThemes)=> {
  firebase.initializeApp(FbCreds);
  editableOptions.theme = 'bs3';
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-sm';
});
