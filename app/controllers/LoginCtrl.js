'use strict';

app.controller('LoginCtrl', function($scope, AuthFactory, UserFactory, $window) {
  $scope.account = {
    email: "",
    password: ""
  };

  $scope.loginWithEmailAndPassword = ()=> {
    AuthFactory.loginUserWithEmail($scope.account)
    .then((data) => {
      console.log("logged in with email", data);
      $window.location.href = '#/workshops';
    });
  };

  $scope.registerWithEmailAndPassword = ()=> {
    AuthFactory.createUser($scope.account)
    .then((data) => {
      console.log("User registered with email and password", data);
      AuthFactory.loginUserWithEmail($scope.account);
    });
  };

  $scope.loginWithGoogle = ()=> {
    AuthFactory.loginUserWithGoogle()
    .then((userData) => {
      console.log('google:', userData);
      if (userData) {
        UserFactory.addUserToFirebaseDB(userData.user, {isButcher: false, butcherLocation: null});
        $window.location.href = '#/workshops';
      }
    });
    console.log('loginWithGoogle clicked');
  };

  $scope.loginWithFacebook = ()=> {
    AuthFactory.loginUserWithFacebook()
    .then((userData)=> {
      console.log('facebook:', userData);
      if (userData) {
        UserFactory.addUserToFirebaseDB(userData.user, {isButcher: false, butcherLocation: null});
        $window.location.href = '#/workshops';
      }
    });
  };

});
