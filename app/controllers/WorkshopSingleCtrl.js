'use strict';

app.controller('WorkshopSingleCtrl', function($scope, $routeParams, $q, $uibModal, BundlesFactory, WorkshopFactory, AuthFactory){

  let orderBundles = [];
  // let ordersAdded = {'test': true, 'testagain': false};


    $scope.open = (isSpecialOrder)=> {
      let modalInstance = $uibModal.open({
        templateUrl: '../partials/modals/singleworkshopmodal.html',
        controller: 'SingleModalCtrl',
        size: 'lg',
        resolve: {
          orderOptions: {
            bundles: orderBundles,
            meals: []
          },
          orders: {
            list: $scope.orders
          },
          isEditing: false,
          isSpecialOrder
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
