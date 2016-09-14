'use strict';

app.controller('ModalCtrl', function($scope, $uibModalInstance, isEditing, BundlesFactory, workshop, AuthFactory){
  $scope.isEditing = isEditing;
  $scope.workshop = workshop;

  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };

  //save workshop
  $scope.addWorkshop = ()=> {
    const savedWorkshop = {
      'id' : AuthFactory.getUserId(),
      'name' : $scope.workshop.name,
      'date' : $scope.workshop.date,
      'bundles' : $scope.bundleSelected.map(e => e.name),
    }

    
    console.log(savedWorkshop);
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

  //bundle selector
  BundlesFactory.getBundles()
    .then((bundles)=> {
      const bundleOptions = [];

      console.log(bundles);
      for(var key in bundles){
        bundleOptions.push({
          'id' : Object.keys(bundles).indexOf(key),
          'name' : bundles[key].name
        });
      }
      $scope.bundleOptions = bundleOptions;
    });

});
