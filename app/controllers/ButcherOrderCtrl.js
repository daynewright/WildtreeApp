'use strict';

app.controller('ButcherOrderCtrl', function($scope, $window, $uibModalInstance, workshop, WorkshopFactory) {

  $scope.showSpinner = true;

  WorkshopFactory.getOrders(workshop.id)
  .then((orders)=> {
    $scope.orders = orders;
    $scope.showSpinner = false;
    console.log('orders from modal:', orders);
  });

  $scope.workshop = workshop;
  console.log($scope.workshop);

  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };

  $scope.print = ()=> {
    $window.print();
  }


});
