'use strict';

app.controller('ButcherOrderCtrl', function($scope, $window, $uibModalInstance, workshop, WorkshopFactory) {

  $scope.showSpinner = true;

  WorkshopFactory.getOrders(workshop.id)
  .then((orders)=> {
    $scope.orders = orders;
    $scope.ordersTotalQuantity = 0;
    orders.forEach(o => $scope.ordersTotalQuantity += o.quantity);
    $scope.showSpinner = false;
  });

  $scope.workshop = workshop;

  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };

});
