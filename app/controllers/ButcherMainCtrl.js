'use strict';

app.controller('ButcherMainCtrl', function($scope, $window, $q, $route, $uibModal, $timeout, UserFactory, WorkshopFactory, BundlesFactory, SearchService) {
  let localStorageWorkshops = [];
  let users = [];

  WorkshopFactory.getWorkshops()
  .then((workshops)=> {
    for(var workshop in workshops){
      if(users.indexOf(workshops[workshop].uid)=== -1){
        users.push(workshops[workshop].uid);
      }
      if( workshops[workshop].isSubmitted && (workshops[workshop].date >= moment(new Date()).format()) ) {
        localStorageWorkshops.push(workshops[workshop]);
      }
    }

    return $q.all(
      users.map((user)=> {
        return UserFactory.getUser(user);
      }));
  })
  .then((usersArray)=> {
    return $q((resolve, reject)=> {
      localStorageWorkshops.forEach((workshopOrder, i) => {
        users.forEach((user, j)=> {
          if(localStorageWorkshops[i].uid === user){
            localStorageWorkshops[i].customer = usersArray[j];
          }
        });
      });
      resolve(localStorageWorkshops);
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
        workshop.isThisWeek = (moment(workshop.date) < moment().clone().startOf('week').add(7, 'day'));
      });
      //move to bottom of chain
      resolve(submittedWorkshops);
    });
  })
  .then((submittedWorkshops)=> {
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
  });

  $scope.printOrder = (workshop)=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/butcherordermodal.html',
      controller: 'ButcherOrderCtrl',
      size: 'lg',
      resolve: {
        workshop
      }
    });
  };

  $scope.approveWorkshop = (workshopId)=> {
    WorkshopFactory.updateWorkshop({isApproved: true}, workshopId)
    .then(()=> {
      $route.reload();
    });
  };

  $scope.deleteWorkshop = (workshopId) => {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/deletemodal.html',
      controller: 'DeleteModalCtrl',
      resolve: { 
        workshop: {
          workshopId,
          isWorkshop: true
        }
      }
    });
  };

  $scope.$watch(function () { return SearchService.getSearchText(); }, function (newValue, oldValue) {
        if (newValue !== null) {
            $scope.searchText= SearchService.getSearchText();
        }
    }, true);

});
