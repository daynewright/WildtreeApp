'use strict';

app.controller('WorkshopCtrl', function($scope, $q, $uibModal, $route, $location, WorkshopFactory, BundlesFactory, AuthFactory, SearchService){
  const uid = AuthFactory.getUserId();
  let repWorkshops = [];

  $scope.showSpinner = true;

  //opens 'add new workshop' modal
  $scope.open = ()=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/workshopsmodal.html',
      controller: 'ModalCtrl',
      size: 'lg',
      resolve: {
        workshop: {
          name: "",
          description: "",
          date: new Date(),
          time: ""
        },
        isEditing: false
      }
    });
  };

  //opens modal to edit workshop
  $scope.editWorkshop = (workshop)=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/workshopsmodal.html',
      controller: 'ModalCtrl',
      resolve :{
          workshop: {
            name: workshop.name,
            date: new Date(workshop.date),
            time: new Date(workshop.time),
            bundleSelected: workshop.bundles,
            id: workshop.id
          },
          isEditing: true
        }
    });
  };

  //deletes workshop
  $scope.deleteWorkshop = (workshopId)=> {
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

  //determines button functionality on workshop
  $scope.orderStatus = (workshop)=> {
    if(workshop.isSubmitted && !workshop.isApproved){
      $scope.orderBtn = 'ORDER PENDING';
      return true;
    } else if(workshop.isSubmitted && workshop.isApproved){
      $scope.orderBtn = 'ORDER APPROVED!';
      return true;
    }
  };

  $scope.submitOrder = (submitted, workshopId)=> {
    WorkshopFactory.updateWorkshop({'isSubmitted': true}, workshopId)
    .then((response)=> {
      $route.reload();
      console.info('order updated!', response);
    });
  };

  //routes to orders view for workshop
  $scope.viewOrders = (workshopId)=> {
    $location.url(`/workshops/${workshopId}`);
  };

  //loads all user workshops to the view
  $scope.getWorkshops = ()=> {
    let keyArray = [];

    return WorkshopFactory.getWorkshops(uid)
      .then((workshops)=> {
        return $q((resolve, reject)=> {
          keyArray = Object.keys(workshops);
          keyArray.forEach((e) => {
            workshops[e].dateFormated = moment(workshops[e].date).format('MM/DD/YYYY');
            workshops[e].timeFormated = moment(workshops[e].time).format('hh:mma');
            workshops[e].isThisWeek = (moment(workshops[e].date) < moment().clone().startOf('week').add(7, 'day'));
            workshops[e].isExpired = (moment(workshops[e].date) < moment().add(1,'day').endOf('day'));
            repWorkshops.push(workshops[e]);
          });
          resolve(repWorkshops.sort((a, b) => new Date(a.date) - new Date(b.date)));
        });
      })
      .then((repWorkshops)=> {
        return $q((resolve, reject)=> {
          repWorkshops.forEach((workshop, index)=> {
            repWorkshops[index].totalCost = 0;

            WorkshopFactory.getOrders(workshop.id)
            .then((orders)=> {
              orders.forEach((order)=> {
                repWorkshops[index].totalCost += (order.bundlePrice * order.quantity);
              });
            });
          });
          resolve(repWorkshops);
        });
      })
      .then((repWorkshops)=> {
        return $q((resolve, reject)=> {
          $scope.repWorkshops = [];
          $scope.expiredWorkshop = [];
          repWorkshops.forEach((w) => {
            w.dateFormated >= moment(new Date()).format('MM/DD/YYYY') ? $scope.repWorkshops.push(w) : $scope.expiredWorkshop.push(w);
          });
          resolve();
        });
      })
      .then(()=> {
        $scope.showSpinner = false;
      });
    };

  function getMeals(bundles){
    return $q((resolve, reject)=> {
      const meals = [];
      bundles.forEach((bundle)=> {
        BundlesFactory.getMeals(bundle.bundleId)
        .then((bundleMeals)=> {
          Object.keys(bundleMeals).forEach(e => meals.push(bundleMeals[e]));
        });
      });
      resolve(meals);
    });
  }

  //bundle tool tip
  $scope.getBundleName = (bundles)=> {
    let bundle = ``;
     bundles.forEach((e, i)=> {
      bundle += `${i+1}) ${e.name} ($${e.price})`;
      if(i < bundles.length){
        bundle += `\n`;
      }
    });
    return bundle;
 };

 $scope.$watch(function () { return SearchService.getSearchText(); }, function (newValue, oldValue) {
       if (newValue !== null) {
           $scope.searchText= SearchService.getSearchText();
       }
   }, true);

});
