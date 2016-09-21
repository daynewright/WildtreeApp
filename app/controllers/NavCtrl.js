'use strict';

app.controller('NavCtrl', function($scope, $window, $location, AuthFactory, UserFactory) {

  // Logs out current user
  $scope.logout = () => {
    AuthFactory.logout()
    .then((logoutData) => {
      $window.location.href = '#/';
      console.log('Logged out', logoutData);
    });
  };

  firebase.auth().onAuthStateChanged(function(user) {
    $scope.isLoggedIn = AuthFactory.isAuthenticated();

    if($scope.isLoggedIn){
      UserFactory.getUser(AuthFactory.getUserId()).then((user) => { $scope.isButcher = user.isButcher;});
    }
  });

});
