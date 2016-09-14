'use strict';

app.factory('BundlesFactory', function($q, $http, FirebaseURL){

  let getBundles = ()=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}bundles.json`)
      .success((bundles)=> {
        resolve(bundles);
      })
      .error((error)=> {
        console.log(error);
        reject(error);
      });
    });
  };

  return {getBundles};
});
