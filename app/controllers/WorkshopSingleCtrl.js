'use strict';

app.controller('WorkshopSingleCtrl', function($scope, $routeParams, $q, $uibModal, BundlesFactory, WorkshopFactory, AuthFactory){

  let orderBundles = [];


    $scope.open = ()=> {
      let modalInstance = $uibModal.open({
        templateUrl: '../partials/modals/singleworkshopmodal.html',
        controller: 'SingleModalCtrl',
        size: 'lg',
        resolve: {
          order: {
            bundles: orderBundles,
            meals: []
          },
          isEditing: false
        }
      });
    };

    WorkshopFactory.getWorkshops(AuthFactory.getUserId())
    .then((workshops)=> {
      return $q.all(
        workshops[$routeParams.workshopId].bundles.map((bundle)=> {
          return {'name': bundle.name, 'price': bundle.price, 'id': bundle.bundleId};
      }));
    })
    .then((bundles)=> {
      orderBundles = bundles;
    });

    WorkshopFactory.getOrders($routeParams.workshopId)
    .then((orders)=> {
      console.log('orders: ', orders);
      $scope.orders = orders;
    });

});
