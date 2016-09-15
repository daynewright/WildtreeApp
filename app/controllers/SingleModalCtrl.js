'use strict';

app.controller('SingleModalCtrl', function($scope, $uibModalInstance, $routeParams, $route, isEditing, BundlesFactory, order, AuthFactory, WorkshopFactory){
  $scope.isEditing = isEditing;
  $scope.showMeals = false;
  $scope.order = order;

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
        // meals.bundleName = $scope.selectedBundle.name;
        // meals.bundlePrice = $scope.selectedBundle.price;
        $scope.meals = meals;
        console.log('meals obj after select: ', $scope.meals);
      });
    });
  };

  $scope.addOrder = (meals, quantity)=> {
    console.log('meals: ', meals);
    console.log('quantity: ', quantity);
    console.log('workshopId: ', $routeParams.workshopId);

    //build order as newOrder
    let newOrder = {
      meals: meals,
      quantity: quantity,
      workshopId: $routeParams.workshopId,
      bundleName: $scope.selectedBundle.name,
      bundlePrice: $scope.selectedBundle.price
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


});
