'use strict';

app.controller('WorkshopCtrl', function($scope, $uibModal){

  $scope.open = ()=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/workshopsmodal.html',
      controller: 'ModalCtrl',
      resolve: {
        workshop: {
          name: "test",
          description: "",
          date: new Date()
        },
        isEditing: false
      }
    });
  };





});
