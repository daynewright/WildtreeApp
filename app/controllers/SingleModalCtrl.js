'use strict';

app.controller('SingleModalCtrl', function($scope, $uibModalInstance, isEditing, BundlesFactory, order, AuthFactory, WorkshopFactory, $route){
  $scope.isEditing = isEditing;
  console.log(order);
  $scope.order = order;

  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };


});
