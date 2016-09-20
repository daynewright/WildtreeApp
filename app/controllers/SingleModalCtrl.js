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


  console.log('orderOptions object: ', orderOptions);

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
        console.log('meals obj after select: ', $scope.meals);
      });
    });
  };

  $scope.addOrder = (meals, quantity)=> {
    console.log('meals: ', meals);
    console.log('quantity: ', quantity);
    console.log('workshopId: ', $routeParams.workshopId);
    console.log('isSpecialOrder: ',isSpecialOrder);

    //build order as newOrder
    let newOrder = {
      meals: meals,
      quantity: quantity,
      workshopId: $routeParams.workshopId,
      bundleName: $scope.selectedBundle.name,
      bundlePrice: $scope.selectedBundle.price,
      specialOrder: $scope.isSpecialOrder
    };
    console.log(newOrder);

    WorkshopFactory.addOrder(newOrder)
    .then((result)=> {
      $uibModalInstance.close();
      $route.reload();
      console.log('order added:', newOrder);
      console.log('FB response:', result);
    });
  };

  $scope.checkAddOrdersAval();

});
