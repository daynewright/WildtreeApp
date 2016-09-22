'use strict';

app.controller('ButcherMainCtrl', function($scope, $window, $q, UserFactory, WorkshopFactory, BundlesFactory) {
  let workshopOrders = [];
  let users = [];

  WorkshopFactory.getWorkshops()
  .then((workshops)=> {
    for(var workshop in workshops){
      if(users.indexOf(workshops[workshop].uid)=== -1){
        users.push(workshops[workshop].uid);
      }
      workshopOrders.push(workshops[workshop]);
    }

    return $q.all(
      users.map((user)=> {
        return UserFactory.getUser(user);
      }));
  })
  .then((usersArray)=> {
    return $q((resolve, reject)=> {
      workshopOrders.forEach((workshopOrder) => {
        users.forEach((user, index)=> {
          if(workshopOrder.uid === user){
            workshopOrder.customer = usersArray[index];
          }
        });
      });
      resolve(workshopOrders);
    });
  })
  .then((workshopOrders)=> {
    console.log(workshopOrders);
    $scope.workshopOrders = workshopOrders;
  });


  //   console.log(workshopOrders);
  //   return $q.all(
  //     workshopOrders.map((workshop)=> {
  //       return WorkshopFactory.getOrders(workshop.id);
  //     }));
  // })
  // .then((ordersArray)=> {
  //   workshopOrders.forEach((workshop)=> {
  //     ordersArray.forEach((order)=>{
  //       if(workshop.id === order.)
  //     })
  //   })
  // });



});
