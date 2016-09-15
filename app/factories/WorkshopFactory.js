'use strict';

app.factory('WorkshopFactory', function($q, $http, FirebaseURL){

  const getWorkshops = (userId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}workshops.json?orderBy="uid"&equalTo="${userId}"`)
      .success((workshops)=> {
        console.log('workshops:', workshops);
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
        console.error('I was unable to save workshop data:', error);
        console.error(error);
        reject(error);
      });
    });
  };

  const getOrders = (workshopId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}orders.json?orderBy="uid"&equalTo="${workshopId}"`)
      .success((workshops)=> {
        resolve(workshops);
      })
      .error((error)=> {
        console.error('I was unable to get workshops for user: ', error);
        reject(error);
      });
    });
  };

  const addOrder = (order)=> {
    return $q((resolve, reject)=> {
      $http.post(`${FirebaseURL}orders.json`, JSON.stringify(order))
      .success((fbResult)=> {
        resolve(fbResult);
      })
      .error((error)=> {
        console.error('I was unable to save this order:', error);
        console.error(error);
        reject(error);
      });
    });
  };

  const updateOrder = (orderObj, orderId)=> {
    return $q((resolve, reject)=>{
      $http.patch(`${FirebaseURL}orders/${orderId}.json`, JSON.stringify(orderObj))
        .success((updatedObj)=>{
          resolve(updatedObj);
        })
        .error((error)=>{
          console.log('I was unable to update this order: ', error);
          reject(error);
        });
    });
  };

  return {getWorkshops, postWorkshops, getOrders, addOrder, updateOrder};

});
