'use strict';

app.controller('DeleteModalCtrl', function($scope, $uibModalInstance, $route, $q, workshopId, WorkshopFactory) {
    $scope.confirmDelete = () => {
        console.log('delete clicked');
        WorkshopFactory.deleteWorkshop(workshopId.workshopId)
        .then(()=> {
            return $q((resolve, reject) => {
                $uibModalInstance.close();
                resolve();
            });
        })
        .then(()=> $route.reload());
    };
    
    //close modal
    $scope.close = ()=> {
        $uibModalInstance.close();
    };
});