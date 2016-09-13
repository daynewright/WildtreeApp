'use strict';

let app = angular.module('MyApp', ['ngRoute'])
          .constant('FirebaseURL', 'https://wildtree-app.firebaseio.com/');

let isAuth = (AuthFactory)=> new Promise((resolve, reject)=>{
  // This will be a boolean and it will resolve if its true, meaning you can access the URLs below
  if(AuthFactory.isAuthenticated()){
    resolve();
  } else {
    reject();
  }
});


app.config(($routeProvider)=> {
  $routeProvider
  .when('/login', {
    templateUrl: 'partials/login.html',
    controller: 'LoginCtrl'
  });
});

app.run((FbCreds)=> {
  firebase.initializeApp(FbCreds);
});
