'use strict';

app.controller('DeleteModalCtrl', function($scope, $uibModalInstance, $route, $q, workshop, WorkshopFactory) {
    $scope.confirmDelete = () => {
        if(workshop.isWorkshop){
            WorkshopFactory.deleteWorkshop(workshop.workshopId)
            .then(()=> {
                return $q((resolve, reject) => {
                    $uibModalInstance.close();
                    resolve();
                });
            })
            .then(()=> $route.reload());
        } else {
            WorkshopFactory.deleteOrder(workshop.orderId)
            .then(()=>{
                return $q((resolve, reject) => {
                    if(workshop.orders[workshop.index] && workshop.orders[workshop.index].id == workshop.orderId){
                        workshop.orders.splice(workshop.index, 1);
                    } else {
                        workshop.custOrders.splice(workshop.index, 1);
                    }
                    console.log('Order deleted: ', workshop.orderId);
                    resolve();
                });
            })
            .then(() => $uibModalInstance.close());
        }
    };
    
    //close modal
    $scope.close = ()=> {
        $uibModalInstance.close();
    };
});