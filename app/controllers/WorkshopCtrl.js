'use strict';

app.controller('WorkshopCtrl', function($scope, $q, $uibModal, $route, $location, WorkshopFactory, BundlesFactory, AuthFactory){
  const uid = AuthFactory.getUserId();
  let repWorkshops = [];

  //opens 'add new workshop' modal
  $scope.open = ()=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/workshopsmodal.html',
      controller: 'ModalCtrl',
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
            bundleSelected: workshop.bundles
          },
          isEditing: true
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
      console.log('order updated!', response);
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
          keyArray.forEach(e => repWorkshops.push(workshops[e]));
          resolve(repWorkshops);
        });
      })
      .then((repWorkshops)=> {
        return $q.all(
          repWorkshops.map((workshop)=> {
            return getMeals(workshop.bundles);
          })
        );
      })
      .then((bundlesArray)=> {
        bundlesArray.forEach((meals, i)=> {
          console.log('here', meals);
          //repWorkshops[i].bundles[i].meals = meals;
        });
        $scope.repWorkshops = repWorkshops;
        console.log('repWorkshops:', repWorkshops);

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

  //getWorkshops();

});
