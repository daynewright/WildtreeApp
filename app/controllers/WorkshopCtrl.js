'use strict';

app.controller('WorkshopCtrl', function($scope, $q, $uibModal, $route, $location, WorkshopFactory, BundlesFactory, AuthFactory){
  const uid = AuthFactory.getUserId();
  let repWorkshops = [];


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


  $scope.viewOrders = (workshopId)=> {
    $location.url(`/workshops/${workshopId}`);
  };


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
