'use strict';

app.factory('BundlesFactory', function($q, $http, FirebaseURL){


  //get bundles for workshop form
  const getBundles = ()=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}bundles.json`)
      .success((bundles)=> {
        resolve(bundles);
      })
      .error((error)=> {
        console.error('Could not get bundles: ', error);
        reject(error);
      });
    });
  };

  //get meals for a bundle
  const getMeals = (bundleId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}meals.json?orderBy="bundleId"&equalTo="${bundleId}"`)
      .success((meals)=> {
        let formatedMeals = [];
        for(var key in meals){
          formatedMeals.push(meals[key]);
        }
        resolve(formatedMeals);
      })
      .error((error)=> {
        console.error('Could not get meals: ', error);
        reject(error);
      });
    });
  };

  return {getBundles, getMeals};
});
