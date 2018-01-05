'use strict';

app.factory('UserFactory', function($http, $q, FirebaseURL){

  let getUser = (userId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}users.json?orderBy="userId"&equalTo="${userId}"`)
      .then((userData)=> {
        resolve(userData.data[Object.keys(userData.data)]);
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
      .then((userData)=> {
        if(Object.keys(userData.data).length){
          console.log('userdata from success:', userData);
          formatedUser = userData.data[Object.keys(userData.data)[0]];
          console.log('user already exists. Not adding!', formatedUser);
          reject(formatedUser);
        }
        resolve(formatedUser);
      });
    })
    .then((formatedUser)=> {
      return $q((resolve, reject)=> {
        $http.post(`${FirebaseURL}users.json`, angular.toJson(formatedUser.data));
        resolve(formatedUser.data);
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
        .then((users)=> {
          let formatedUsers = [];
          if(Object.keys(users.data).length){
            for(var user in users.data){
              formatedUsers.push(users.data[user]);
            }
          }
          resolve(formatedUsers);
        });
    });
  };

  return {addUserToFirebaseDB, getUser, getAllUsers};

});
