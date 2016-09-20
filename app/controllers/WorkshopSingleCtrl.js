'use strict';

app.controller('WorkshopSingleCtrl', function($scope, $routeParams, $route, $q, $uibModal, BundlesFactory, WorkshopFactory, AuthFactory){

  let orderBundles = [];

  $scope.totalBundles = 0;
  $scope.totalCost = 0;
  $scope.showSpinner = true;


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
          isSpecialOrder
        }
      });
    };

    $scope.deleteOrder = (orderId)=> {
      WorkshopFactory.deleteOrder(orderId)
      .then((response)=>{
        $route.reload();
        console.log('Order deleted: ', response);
      });
    };

    //get workshop
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

    //get orders
    WorkshopFactory.getOrders($routeParams.workshopId)
    .then((orders)=> {
      return $q((resolve, reject)=> {
        orders.forEach((order)=> {
          $scope.totalBundles += order.quantity;
          $scope.totalCost += (order.bundlePrice * order.quantity);
        });
        console.log('orders: ', orders);
        $scope.orders = orders.filter((order)=> !order.specialOrder);
        $scope.custOrders = orders.filter((order)=> order.specialOrder);
        resolve();
      });
    })
    .then(()=> {
      return $q((resolve, reject)=> {
        $scope.orders.forEach((order, index)=> {
          if(order.quantity) {
            $scope.$watch(`orders[${index}]`, watchQty, true);
          }
        });
        resolve();
      });
    })
    .then(()=> {
      $scope.showSpinner = false;
    });


  function watchQty(val, oldVal){
    if(val !== oldVal){
      if(parseInt(val.quantity)){
        WorkshopFactory.updateOrder({quantity: parseInt(val.quantity)}, val.id)
        .then(()=> {
          console.log('Order quantity updated to Firebase :', val.quantity, ' - ', val.id);
          $route.reload();
        });
      } else {
        console.log('Number was not entered.  Not patching Firebase.');
      }
    }
  }

});
