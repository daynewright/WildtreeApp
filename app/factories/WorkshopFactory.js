'use strict';

app.factory('WorkshopFactory', function($q, $http, FirebaseURL){

  //workshop functions
  const getWorkshops = (userId)=> {

    const Url = userId ? `${FirebaseURL}workshops.json?orderBy="uid"&equalTo="${userId}"` : `${FirebaseURL}workshops.json?`;

    return $q((resolve, reject)=> {
      $http.get(Url)
      .then((workshops)=> {
        for(var key in workshops.data){ workshops.data[key].id = key; }
        resolve(workshops.data);
      })
      .catch((error)=> {
        console.error('I was unable to get workshops for user: ', error);
        reject(error);
      });
    });
  };

  const postWorkshops = (workshop)=> {
    return $q((resolve, reject)=> {
      $http.post(`${FirebaseURL}workshops.json`, angular.toJson(workshop))
      .then((fbResult)=> {
        resolve(fbResult.data);
      })
      .catch((error)=> {
        console.error('I was unable to save workshop data:', error);
        console.error(error);
        reject(error);
      });
    });
  };

  const updateWorkshop = (workshopObj, workshopId)=> {
    return $q((resolve, reject)=>{
      $http.patch(`${FirebaseURL}workshops/${workshopId}.json`, angular.toJson(workshopObj))
        .then((response)=>{
          resolve(response.data);
        })
        .catch((error)=>{
          console.error('I was unable to update this workshop: ', error);
          reject(error);
        });
    });
  };

  const deleteOrder = (orderId)=> {
    return $q((resolve, reject)=> {
      $http.delete(`${FirebaseURL}orders/${orderId}.json`)
      .then((response)=> {
        resolve(response.data);
      })
      .catch((error)=> {
        console.error('I was unable to delete the order: ', error);
        reject(error);
      });
    });
  };

  const deleteWorkshop = (workshopId) => {
    return $q((resolve, reject)=> {
      $http.delete(`${FirebaseURL}workshops/${workshopId}.json`)
        .success((response)=> {
          resolve(response.data);
        })
        .catch((error)=> {
          console.error('I was unable to delete this workshop:', error);
        });
    })
    .then(()=> {
      let orders = [];
      return $q((resolve,reject)=> {
        $http.get(`${FirebaseURL}orders.json?orderBy="workshopId"&equalTo="${workshopId}"`)
        .then((orderObj)=> {
          Object.keys(orderObj.data).forEach((key)=> {
            orders.push(key);
          });
          resolve(orders);
        })
        .catch((error)=> {
          console.error('Error getting orders for deleted workshop: ', error);
        });
      });
    })
    .then((orders)=> {
      return $q.all(
        orders.data.map((orderId)=> {
          return deleteOrder(orderId);
        })
      );
    })
    .then((response)=> {
      console.log('All orders for workshop deleted!', response);
    });
  };

  //order functions
  const getOrders = (workshopId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}orders.json?orderBy="workshopId"&equalTo="${workshopId}"`)
      .then((orders)=> {
        let formatedOrders = [];
        for(var key in orders.data){
          orders.data[key].id = key;
          formatedOrders.push(orders.data[key]);
        }
        resolve(formatedOrders);
      })
      .catch((error)=> {
        console.error('I was unable to get orders for workshop: ', error);
        reject(error);
      });
    });
  };

  const addOrder = (order)=> {
    return $q((resolve, reject)=> {
      $http.post(`${FirebaseURL}orders.json`, angular.toJson(order))
      .then((fbResult)=> {
        resolve(fbResult.data);
      })
      .catch((error)=> {
        console.error('I was unable to save this order:', error);
        reject(error);
      });
    });
  };

  const updateOrder = (orderObj, orderId)=> {
    return $q((resolve, reject)=>{
      $http.patch(`${FirebaseURL}orders/${orderId}.json`, JSON.stringify(orderObj))
        .then((updatedObj)=>{
          resolve(updatedObj.data);
        })
        .catch((error)=>{
          console.error('I was unable to update this order: ', error);
          reject(error);
        });
    });
  };

  return {getWorkshops, postWorkshops, updateWorkshop, deleteWorkshop, getOrders, addOrder, updateOrder, deleteOrder};

});
