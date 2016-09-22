'use strict';

app.controller('TopCtrl', ($route, $window, $location, $scope)=>{
  firebase.auth().onAuthStateChanged(function(user){
    $scope.showSpinner = true;
    if (user){
      console.log(user);
      console.log("Current user logged is?", user.uid);
      $location.path('/butcher');
    } else {
      console.log("no user");
      $window.location.href = '#/login';
    }
  });
});
