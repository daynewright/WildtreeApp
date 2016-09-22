'use strict';

app.controller('ButcherMainCtrl', function($scope, $window, $q, $route, UserFactory, WorkshopFactory, BundlesFactory) {
  let localStorageWorkshops = [];
  let users = [];

  WorkshopFactory.getWorkshops()
  .then((workshops)=> {
    for(var workshop in workshops){
      if(users.indexOf(workshops[workshop].uid)=== -1){
        users.push(workshops[workshop].uid);
      }
      localStorageWorkshops.push(workshops[workshop]);
    }

    return $q.all(
      users.map((user)=> {
        return UserFactory.getUser(user);
      }));
  })
  .then((usersArray)=> {
    return $q((resolve, reject)=> {
      let submittedWorkshops = [];

      localStorageWorkshops.forEach((workshopOrder, i) => {
        if(workshopOrder.isSubmitted){
          submittedWorkshops.push(workshopOrder);
          users.forEach((user, j)=> {
            if(submittedWorkshops[i].uid === user){
              submittedWorkshops[i].customer = usersArray[j];
            }
          });
        }
      });
      resolve(submittedWorkshops);
    });
  })
  .then((submittedWorkshops)=> {
    return $q((resolve, reject)=> {
      submittedWorkshops.sort((a,b)=> {
        return new Date(a.date) - new Date(b.date);
      });
      submittedWorkshops.forEach((workshop) => {
        workshop.dateFormated = moment(workshop.date).format('MM/DD/YYYY');
        workshop.timeFormated = moment(workshop.time).format('hh:mma');
      });
      //move to bottom of chain
      resolve(submittedWorkshops);
    });
  })
  .then((submittedWorkshops)=> {
    console.log(submittedWorkshops);
    return $q((resolve, reject)=> {
      submittedWorkshops.forEach((workshop, i)=> {
        let cost = 0;
        WorkshopFactory.getOrders(workshop.id)
        .then((orders)=> {
          orders.forEach((order)=> {
            cost += (order.bundlePrice * order.quantity);
          });
          submittedWorkshops[i].totalCost = cost.toFixed(2);
        });
      });
    resolve(submittedWorkshops);
    });
  })
  .then((submittedWorkshops)=> {
    $scope.workshopOrders = submittedWorkshops;
    console.log('last then:', submittedWorkshops);
  });

  $scope.printOrder = (workshop)=> {
    console.log('print preview of order...');
  };

  $scope.approveWorkshop = (workshopId)=> {
    WorkshopFactory.updateWorkshop({isApproved: true}, workshopId)
    .then(()=> {
      $route.reload();
    });
    console.log('workshopId', workshopId);
  };

});
