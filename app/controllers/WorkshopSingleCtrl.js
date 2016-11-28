'use strict';

app.controller('WorkshopSingleCtrl', function($scope, $routeParams, $route, $q, $uibModal, BundlesFactory, WorkshopFactory, AuthFactory, SearchService){

  let orderBundles = [];

  $scope.totalBundles = 0;
  $scope.totalCost = 0;
  $scope.showSpinner = true;


    $scope.open = (isSpecialOrder)=> {
      let modalInstance = $uibModal.open({
        templateUrl: '..WildtreeApp/partials/modals/singleworkshopmodal.html',
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

    $scope.totalBundlesOrdered = ()=> {
      var totalBundles = 0;
      $scope.orders.forEach(order => totalBundles += parseInt(order.quantity));
      $scope.custOrders.forEach(order => totalBundles += parseInt(order.quantity));

      return totalBundles;
    };

    $scope.totalCostOrdered = ()=> {
      var totalCost = 0;
      $scope.orders.forEach(order => totalCost += (parseFloat(order.bundlePrice) * parseInt(order.quantity)));
      $scope.custOrders.forEach(order => totalCost += (parseFloat(order.bundlePrice) * parseInt(order.quantity)));

      return totalCost.toFixed(2);
    };

    $scope.deleteOrder = (orderId,i)=> {
      WorkshopFactory.deleteOrder(orderId)
      .then((response)=>{
        if($scope.orders[i] && $scope.orders[i].id == orderId){
          $scope.orders.splice(i, 1);
        } else {
          $scope.custOrders.splice(i, 1);
        }
        console.log('Order deleted: ', orderId);
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

        $scope.custOrders.forEach((order, index)=> {
          if(order.quantity) {
            $scope.$watch(`custOrders[${index}]`, watchQty, true);
          }
        });

        resolve();
      });
    })
    .then(()=> {
      $scope.showSpinner = false;
    });


  function watchQty(val, oldVal, scope){
    if(val !== oldVal){
      if(val && parseInt(val.quantity)){
        WorkshopFactory.updateOrder({quantity: parseInt(val.quantity)}, val.id)
        .then(()=> {
          scope.orders.forEach((order, i) => {
            if(order.id === val.id){ $scope.orders[i].quantity = val.quantity; }
          });
          scope.custOrders.forEach((order, i) => {
            if(order.id === val.id){ $scope.custOrders[i].quantity = val.quantity; }
          });
        });
      } else {
        console.log('Number was not entered.  Not patching Firebase.');
      }
    }
  }

  $scope.$watch(function () { return SearchService.getSearchText(); }, function (newValue, oldValue) {
       if (newValue !== null) {
           $scope.searchText= SearchService.getSearchText();
       }
   }, true);

});
