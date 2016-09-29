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
          console.log('userdata from success:', userData);
          formatedUser = userData[Object.keys(userData)[0]];
          console.log('user already exists. Not adding!', formatedUser);
          reject(formatedUser);
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
    })
    .catch((formatedUser)=> {
      return $q((resolve, reject)=> {
        resolve(formatedUser);
      });
    });
  };

  let getAllUsers = ()=> {
    return $q((resolve, reject)=> {
        $http.get(`${FirebaseURL}users.json`)
        .success((users)=> {
          let formatedUsers = [];
          if(Object.keys(users).length){
            for(var user in users){
              formatedUsers.push(users[user]);
            }
          }
          resolve(formatedUsers);
        });
    });
  };

  return {addUserToFirebaseDB, getUser, getAllUsers};

});
