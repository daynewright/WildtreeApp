'use strict';

app.controller('ModalCtrl', function($scope, $uibModalInstance, $route, isEditing, workshop, BundlesFactory, AuthFactory, WorkshopFactory){
  $scope.isEditing = isEditing;
  $scope.workshop = workshop;
  console.log('workshop: ', workshop.date);
  $scope.bundleSelected = workshop.bundleSelected;

  const uid = AuthFactory.getUserId();

  console.log('workshop obj: ', workshop);
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
          'bundleId' : key,
          'price': bundles[key].price
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
      'time' : $scope.workshop.time,
      'bundles' : $scope.bundleSelected,
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

  //update workshop
  $scope.updateWorkshop = (workshop)=> {
    workshop.bundles = workshop.bundleSelected;
    workshop.bundleSelected = null;
    WorkshopFactory.updateWorkshop(workshop, workshop.id)
    .then((response)=> {
      console.log('Workshop updated!', response);
      $uibModalInstance.close();
      $route.reload();
    });
  };

});
