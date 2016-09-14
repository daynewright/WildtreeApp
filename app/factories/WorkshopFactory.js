'use strict';

app.factory('WorkshopFactory', function($q, $http, FirebaseURL, AuthFactory){

  const getWorkshops = ()=> {
    const userId = AuthFactory.getUserId();
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}workshops.json?orderBy="uid"&equalTo="${userId}"`)
      .success((workshops)=> {
        resolve(workshops);
      })
      .error((error)=> {
        console.error('I was unable to get workshops for user: ', error);
        reject(error);
      });
    });


  };

  const postWorkshops = (workshop)=> {
    return $q((resolve, reject)=> {
      $http.post(`${FirebaseURL}workshops.json`, JSON.stringify(workshop))
      .success((fbResult)=> {
        resolve(fbResult);
      })
      .error((error)=> {
        console.error('I was unable to save workshop data:', workshop);
        console.error(error);
        reject(error);
      });
    });
  };

  return {getWorkshops, postWorkshops};

});
