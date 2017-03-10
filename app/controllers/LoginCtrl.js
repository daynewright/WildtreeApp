'use strict';

app.controller('LoginCtrl', function($scope, AuthFactory, UserFactory, $window) {
  $scope.account = {
    email: "",
    password: ""
  };

  $scope.loginWithEmailAndPassword = ()=> {
    AuthFactory.loginUserWithEmail($scope.account)
    .then((data) => {
      $window.location.href = '#/workshops';
    });
  };

  $scope.registerWithEmailAndPassword = ()=> {
    AuthFactory.createUser($scope.account)
    .then((data) => {
      AuthFactory.loginUserWithEmail($scope.account);
    });
  };

  $scope.loginWithGoogle = ()=> {
    AuthFactory.loginUserWithGoogle()
    .then((userData) => {
      if (userData) {
        UserFactory.addUserToFirebaseDB(userData.user, {isButcher: false, butcherLocation: null})
        .then((user)=> {
          if(user.isButcher) {
            $window.location.href = '#/butcher';
          } else {
            $window.location.href = '#/workshops';
          }
        });
      }
    });
  };

  $scope.loginWithFacebook = ()=> {
    AuthFactory.loginUserWithFacebook()
    .then((userData)=> {
      if (userData) {
        UserFactory.addUserToFirebaseDB(userData.user, {isButcher: false, butcherLocation: null})
        .then((user)=> {
          if(user.isButcher) {
            $window.location.href = '#/butcher';
          } else {
            $window.location.href = '#/workshops';
          }
        });
      }
    });
  };

});
