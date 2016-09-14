'use strict';

app.controller('ModalCtrl', function($scope, $uibModalInstance, isEditing, BundlesFactory, workshop){
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


  // $scope.bundleOptions = [
  //   {id: 1,  name : "Java"},
  //   {id: 2,  name : "C"},
  //   {id: 3,  name : "C++"},
  //   {id: 4,  name : "AngularJs"},
  //   {id: 5,  name : "JavaScript"}
  // ];

});
