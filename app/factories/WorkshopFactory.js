'use strict';

app.factory('WorkshopFactory', function($q, $http, FirebaseURL){

  //workshop functions
  const getWorkshops = (userId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}workshops.json?orderBy="uid"&equalTo="${userId}"`)
      .success((workshops)=> {
        for(var key in workshops){ workshops[key].id = key; }
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
      $http.post(`${FirebaseURL}workshops.json`, angular.toJson(workshop))
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

  const updateWorkshop = (workshopObj, workshopId)=> {
    console.log(`${FirebaseURL}workshops/${workshopId}.json`);
    return $q((resolve, reject)=>{
      $http.patch(`${FirebaseURL}workshops/${workshopId}.json`, angular.toJson(workshopObj))
        .success((response)=>{
          resolve(response);
        })
        .error((error)=>{
          console.log('I was unable to update this workshop: ', error);
          reject(error);
        });
    });
  };

  const deleteWorkshop = (workshopId) => {
    return $q((resolve, reject)=> {
      $http.delete(`${FirebaseURL}workshops/${workshopId}.json`)
        .success((response)=> {
          resolve(response);
        })
        .error((error)=> {
          console.log('I was unable to delete this workshop:', error)
        });
    })
    .then(()=> {
      let orders = [];
      return $q((resolve,reject)=> {
        $http.get(`${FirebaseURL}orders.json?orderBy="workshopId"&equalTo="${workshopId}"`)
        .success((orderObj)=> {
          Object.keys(orderObj).forEach((key)=> {
            orders.push(key);
          });
          resolve(orders);
        })
        .error((error)=> {
          console.log('Error getting orders for deleted workshop: ', error);
        });
      });
    })
    .then((orders)=> {
      return $q.all(
        orders.map((orderId)=> {
          return deleteOrder(orderId);
        })
      );
    })
    .then((response)=> {
      console.log('All orders for workshop deleted!', response);
    });
  }

  //order functions
  const getOrders = (workshopId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}orders.json?orderBy="workshopId"&equalTo="${workshopId}"`)
      .success((orders)=> {
        let formatedOrders = [];
        for(var key in orders){
          formatedOrders.push(orders[key]);
        }
        resolve(formatedOrders);
      })
      .error((error)=> {
        console.error('I was unable to get orders for workshop: ', error);
        reject(error);
      });
    });
  };

  const addOrder = (order)=> {
    return $q((resolve, reject)=> {
      $http.post(`${FirebaseURL}orders.json`, angular.toJson(order))
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

  const deleteOrder = (orderId)=> {
    return $q((resolve, reject)=> {
      $http.delete(`${FirebaseURL}orders/${orderId}.json`)
      .success((response)=> {
        resolve(response);
      })
      .error((error)=> {
        console.log('I was unable to delete the order: ', error);
        reject(error);
      });
    });
  }

  return {getWorkshops, postWorkshops, updateWorkshop, deleteWorkshop, getOrders, addOrder, updateOrder, deleteOrder};

});
