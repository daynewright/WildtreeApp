'use strict';

app.factory('UserFactory', function($http, $q, FirebaseURL){

  let getUser = (userId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}users.json?orderBy="userId"&equalTo="${userId}"`)
      .success((userData)=> {
        resolve(userData[Object.keys(userData)]);
      });
    });
  };

  let addUserToFirebaseDB = (userData, butcher)=> {
    let formatedUser = {
      name: userData.displayName,
      email: userData.email,
      photo: userData.photoURL,
      userId: userData.uid,
      isButcher: butcher.isButcher,
      butcherLocation: butcher.butcherLocation
    };

    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}users.json?orderBy="userId"&equalTo="${userData.uid}"`)
      .success((userData)=> {
        if(Object.keys(userData).length){
          formatedUser = userData[Object.keys(userData)];
          console.log('user already exists. Not adding!', formatedUser);
          reject();
        }
        resolve(formatedUser);
      });
    })
    .then((formatedUser)=> {
      return $q((resolve, reject)=> {
        $http.post(`${FirebaseURL}users.json`, angular.toJson(formatedUser));
        resolve(formatedUser);
      });
    })
    .then((formatedUser)=> {
      console.log('user added to firebase successfully!', formatedUser);
    });
  };

  return {addUserToFirebaseDB, getUser};

});
