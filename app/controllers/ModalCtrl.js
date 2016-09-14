'use strict';

app.controller('ModalCtrl', function($scope, $uibModalInstance, isEditing, workshop){
  $scope.isEditing = isEditing;
  $scope.workshop = workshop;

  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };



  //date selector
  $scope.clear = function() {
    $scope.workshop.date = null;
  };

  $scope.options = {
    minDate: new Date(),
    showWeeks: true,
    format: 'MM/d/yyyy'
  };

  $scope.datePickerOpened = false;

  $scope.openDatePicker = ()=> {
    $scope.datePickerOpened = true;
  };

});
