'use strict';

app.factory('BundlesFactory', function($q, $http, FirebaseURL){


  //get bundles for workshop form
  const getBundles = ()=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}bundles.json`)
      .then((bundles)=> {
        resolve(bundles.data);
      })
      .catch((error)=> {
        console.error('Could not get bundles: ', error);
        reject(error);
      });
    });
  };

  //get meals for a bundle
  const getMeals = (bundleId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}meals.json?orderBy="bundleId"&equalTo="${bundleId}"`)
      .then((meals)=> {
        let formatedMeals = [];
        for(var key in meals.data){
          formatedMeals.push(meals.data[key]);
        }
        resolve(formatedMeals);
      })
      .catch((error)=> {
        console.error('Could not get meals: ', error);
        reject(error);
      });
    });
  };

  return {getBundles, getMeals};
});
