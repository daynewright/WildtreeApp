'use strict';

app.controller('SingleModalCtrl', function($scope, $uibModalInstance, $routeParams, $route, $q, BundlesFactory, orderOptions, orders, isSpecialOrder, WorkshopFactory){

  //adding list of bundles already added to workshop order
  const ordersAdded = orders.list.map(item => item.bundleName);
  $scope.orderOptions = orderOptions;

  $scope.checkAddOrdersAval = ()=> {
    orderOptions.bundles.forEach((bundle, index)=> {
      ordersAdded.forEach((bundleAdded)=> {
        if(bundle.name === bundleAdded && !isSpecialOrder){
          $scope.orderOptions.bundles[index].disable = true;
        }
        if(isSpecialOrder){
          $scope.orderOptions.bundles[index].disable = false;
        }
      });
    });
  };

  //scope items
  $scope.isSpecialOrder = isSpecialOrder;
  $scope.showMeals = false;


  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };

  $scope.getMeals = ()=> {
    let bundleId = $scope.selectedBundle.id;

    $scope.showMeals = true;

    $scope.$watch('showMeals', function(){
      BundlesFactory.getMeals(bundleId)
      .then((meals)=> {
        meals.sort((a,b)=> a.index - b.index);
        $scope.meals = meals;
      });
    });
  };

  $scope.addOrder = (meals, quantity)=> {

    //build order as newOrder
    let newOrder = {
      meals: meals,
      quantity: quantity,
      workshopId: $routeParams.workshopId,
      bundleName: $scope.selectedBundle.name,
      bundlePrice: $scope.selectedBundle.price,
      specialOrder: $scope.isSpecialOrder
    };

    WorkshopFactory.addOrder(newOrder)
    .then((result)=> {
      $uibModalInstance.close();
      $route.reload();
    });
  };

  $scope.checkAddOrdersAval();

});
