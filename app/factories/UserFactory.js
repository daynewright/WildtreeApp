'use strict';

app.factory('UserFactory', function($http, $q, FirebaseURL){


  let addUserToFirebaseDB = (userData, butcher)=> {
    console.log(userData);
    let formatedUser = {
      name: userData.displayName,
      email: userData.email,
      photo: userData.photoURL,
      userId: userData.uid,
      isButcher: butcher.isButcher,
      butcherLocation: butcher.butcherLocation
    };
    console.log('user data in UserFactory:', formatedUser);
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}users.json?orderBy="userId"&equalTo="${userData.uid}"`)
      .success((userData)=> {
        if(Object.keys(userData).length){
          console.log('user already exists. Not adding!');
          reject();
        }
        resolve(formatedUser);
      });
    })
    .then((formatedUser)=> {
      return $q((resolve, reject)=> {
        $http.post(`${FirebaseURL}users.json`, angular.toJson(formatedUser));
        resolve();
      })
    })
    .then(()=> {
      console.log('user added to firebase successfully!', formatedUser);
    });
  };


  return {addUserToFirebaseDB};

});
