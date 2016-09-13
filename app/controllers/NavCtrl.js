'use strict';

app.controller('NavCtrl', function($scope, AuthFactory, $window, $location) {

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
  });

  $scope.isActive = (viewLocation) => viewLocation === $location.path();
});
