'use strict';

app.controller('TopCtrl', ($route, $window, $location, $scope)=>{
  firebase.auth().onAuthStateChanged(function(user){
    $scope.showSpinner = true;
    if (user){
      $location.path('/butcher');
    } else {
      $window.location.href = '#/login';
    }
  });
});
