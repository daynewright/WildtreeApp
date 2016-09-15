'use strict';

app.controller('ModalCtrl', function($scope, $uibModalInstance, isEditing, BundlesFactory, workshop, AuthFactory, WorkshopFactory, $route){
  $scope.isEditing = isEditing;
  $scope.workshop = workshop;

  const uid = AuthFactory.getUserId();

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
          'name' : bundles[key].name,
          'bundleId' : key
        });
      }
      $scope.bundleOptions = bundleOptions;
  });

  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();

  };

  //save workshop
  $scope.addWorkshop = ()=> {
    const savedWorkshop = {
      'uid' : uid,
      'name' : $scope.workshop.name,
      'date' : $scope.workshop.date,
      'bundles' : $scope.bundleSelected.map((e) =>{ return {'bundleId' : e.bundleId, 'name' : e.name}; }),
      'isApproved' : false,
      'isSubmitted': false
    };

    WorkshopFactory.postWorkshops(savedWorkshop)
      .then((success)=> {
        console.log('workshop Saved!', success);
        $uibModalInstance.close();
        $route.reload();
      });
  };

});
