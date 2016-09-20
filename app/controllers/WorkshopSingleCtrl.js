'use strict';

app.controller('WorkshopSingleCtrl', function($scope, $routeParams, $q, $uibModal, BundlesFactory, WorkshopFactory, AuthFactory){

  let orderBundles = [];
  $scope.totalBundles = 0;
  $scope.totalCost = 0;


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
          isSpecialOrder,
        }
      });
    };

    WorkshopFactory.getWorkshops(AuthFactory.getUserId())
    .then((workshops)=> {
      return $q((resolve, reject)=> {
        $scope.workshop = workshops[$routeParams.workshopId];
        $scope.workshop.date = moment($scope.workshop.date).format('MM/DD/YYYY');
        $scope.workshop.time = moment($scope.workshop.time).format('hh:mma');
        resolve(workshops);
      });
    })
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
      orders.forEach((order)=> {
        $scope.totalBundles += order.quantity;
        $scope.totalCost += (order.bundlePrice * order.quantity);
      });
      console.log('orders: ', orders);
      $scope.orders = orders;
    });

});
