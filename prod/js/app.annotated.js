'use strict';

let app = angular.module('MyApp', ['ngRoute', 'ui.bootstrap', 'multipleSelect', 'xeditable', 'angularSpinner', 'ngPrint'])
          .constant('FirebaseURL', 'https://wildtree-app-prod.firebaseio.com/');

app.config(($routeProvider)=> {
  $routeProvider
  .when('/', {
    templateUrl: 'partials/login.html',
    controller: 'LoginCtrl'
  })
  .when('/login', {
    templateUrl: 'partials/login.html',
    controller: 'LoginCtrl',
  })
  .when('/workshops', {
    templateUrl: 'partials/workshops.html',
    controller: 'WorkshopCtrl',
    rep: true
  })
  .when('/workshops/:workshopId', {
    templateUrl: 'partials/workshopsingle.html',
    controller: 'WorkshopSingleCtrl',
    rep: true
  })
  .when('/butcher', {
    templateUrl: 'partials/butchermain.html',
    controller: 'ButcherMainCtrl',
    butcher: true
  })
  .when('/messages', {
    templateUrl: 'partials/messages.html',
    controller: 'MessagesCtrl'
  })
  .when('/butcher/:orderId', {
    templateUrl: 'partials/butcherorder.html',
    controller: 'ButcherOrderCtrl',
    butcher: true
  })
  .otherwise('/login');
});

app.run((FbCreds, editableOptions, editableThemes)=> {
  firebase.initializeApp(FbCreds);
  editableOptions.theme = 'bs3';
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-sm';
});

app.run(($rootScope, $location, UserFactory, AuthFactory)=> {
  $rootScope.$on('$routeChangeStart', function(event, next, current){
    UserFactory.getUser(AuthFactory.getUserId())
    .then((user)=> {
      if(!user){
        $location.path('/login');
      }

      if(next.$$route.butcher){
        if(user && !user.isButcher){$location.path('/workshops');}
      }
      if(next.$$route.rep){
        if(user && user.isButcher){$location.path('/butcher');}
      }
    });
  });
});

app.run(['$rootScope', '$location', function($rootScope, $location) {
$rootScope.$on('$routeChangeSuccess', function() {
    $rootScope.showSearch = $location.path() == "/workshops" || $location.path() === "/butcher";
  });
}]);
;'use strict';

app.controller('ButcherMainCtrl', ['$scope', '$window', '$q', '$route', '$uibModal', '$timeout', 'UserFactory', 'WorkshopFactory', 'BundlesFactory', 'SearchService', function($scope, $window, $q, $route, $uibModal, $timeout, UserFactory, WorkshopFactory, BundlesFactory, SearchService) {
  let localStorageWorkshops = [];
  let users = [];

  WorkshopFactory.getWorkshops()
  .then((workshops)=> {
    for(var workshop in workshops){
      if(users.indexOf(workshops[workshop].uid)=== -1){
        users.push(workshops[workshop].uid);
      }
      if( workshops[workshop].isSubmitted && (workshops[workshop].date >= moment(new Date()).format()) ) {
        localStorageWorkshops.push(workshops[workshop]);
      }
    }

    return $q.all(
      users.map((user)=> {
        return UserFactory.getUser(user);
      }));
  })
  .then((usersArray)=> {
    return $q((resolve, reject)=> {
      localStorageWorkshops.forEach((workshopOrder, i) => {
        users.forEach((user, j)=> {
          if(localStorageWorkshops[i].uid === user){
            localStorageWorkshops[i].customer = usersArray[j];
          }
        });
      });
      resolve(localStorageWorkshops);
    });
  })
  .then((submittedWorkshops)=> {
    return $q((resolve, reject)=> {
      submittedWorkshops.sort((a,b)=> {
        return new Date(a.date) - new Date(b.date);
      });
      submittedWorkshops.forEach((workshop) => {
        workshop.dateFormated = moment(workshop.date).format('MM/DD/YYYY');
        workshop.timeFormated = moment(workshop.time).format('hh:mma');
        workshop.isThisWeek = (moment(workshop.date) < moment().clone().startOf('week').add(7, 'day'));
      });
      //move to bottom of chain
      resolve(submittedWorkshops);
    });
  })
  .then((submittedWorkshops)=> {
    return $q((resolve, reject)=> {
      submittedWorkshops.forEach((workshop, i)=> {
        let cost = 0;
        WorkshopFactory.getOrders(workshop.id)
        .then((orders)=> {
          orders.forEach((order)=> {
            cost += (order.bundlePrice * order.quantity);
          });
          submittedWorkshops[i].totalCost = cost.toFixed(2);
        });
      });
    resolve(submittedWorkshops);
    });
  })
  .then((submittedWorkshops)=> {
    $scope.workshopOrders = submittedWorkshops;
  });

  $scope.printOrder = (workshop)=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/butcherordermodal.html',
      controller: 'ButcherOrderCtrl',
      size: 'lg',
      resolve: {
        workshop
      }
    });
  };

  $scope.approveWorkshop = (workshopId)=> {
    WorkshopFactory.updateWorkshop({isApproved: true}, workshopId)
    .then(()=> {
      $route.reload();
    });
  };

  $scope.deleteWorkshop = (workshopId) => {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/deletemodal.html',
      controller: 'DeleteModalCtrl',
      resolve: { 
        workshop: {
          workshopId,
          isWorkshop: true
        }
      }
    });
  };

  $scope.$watch(function () { return SearchService.getSearchText(); }, function (newValue, oldValue) {
        if (newValue !== null) {
            $scope.searchText= SearchService.getSearchText();
        }
    }, true);

}]);
;'use strict';

app.controller('ButcherOrderCtrl', ['$scope', '$window', '$uibModalInstance', 'workshop', 'WorkshopFactory', function($scope, $window, $uibModalInstance, workshop, WorkshopFactory) {

  $scope.showSpinner = true;

  WorkshopFactory.getOrders(workshop.id)
  .then((orders)=> {
    $scope.orders = orders;
    $scope.ordersTotalQuantity = 0;
    orders.forEach(o => $scope.ordersTotalQuantity += o.quantity);
    $scope.showSpinner = false;
  });

  $scope.workshop = workshop;

  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };

}]);
;'use strict';

app.controller('DeleteModalCtrl', ['$scope', '$uibModalInstance', '$route', '$q', 'workshop', 'WorkshopFactory', function($scope, $uibModalInstance, $route, $q, workshop, WorkshopFactory) {
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
}]);;'use strict';

app.controller('LoginCtrl', ['$scope', 'AuthFactory', 'UserFactory', '$window', function($scope, AuthFactory, UserFactory, $window) {
  $scope.account = {
    email: "",
    password: ""
  };

  $scope.loginWithEmailAndPassword = ()=> {
    AuthFactory.loginUserWithEmail($scope.account)
    .then((data) => {
      $window.location.href = '#/workshops';
    });
  };

  $scope.registerWithEmailAndPassword = ()=> {
    AuthFactory.createUser($scope.account)
    .then((data) => {
      AuthFactory.loginUserWithEmail($scope.account);
    });
  };

  $scope.loginWithGoogle = ()=> {
    AuthFactory.loginUserWithGoogle()
    .then((userData) => {
      if (userData) {
        UserFactory.addUserToFirebaseDB(userData.user, {isButcher: false, butcherLocation: null})
        .then((user)=> {
          if(user.isButcher) {
            $window.location.href = '#/butcher';
          } else {
            $window.location.href = '#/workshops';
          }
        });
      }
    });
  };

  $scope.loginWithFacebook = ()=> {
    AuthFactory.loginUserWithFacebook()
    .then((userData)=> {
      if (userData) {
        UserFactory.addUserToFirebaseDB(userData.user, {isButcher: false, butcherLocation: null})
        .then((user)=> {
          if(user.isButcher) {
            $window.location.href = '#/butcher';
          } else {
            $window.location.href = '#/workshops';
          }
        });
      }
    });
  };

}]);
;'use strict';

app.controller('MessagesCtrl', ['$scope', '$routeParams', '$q', '$uibModal', '$anchorScroll', '$timeout', '$route', 'AuthFactory', 'ConversationFactory', function($scope, $routeParams, $q, $uibModal, $anchorScroll, $timeout, $route, AuthFactory, ConversationFactory){
  let user = AuthFactory.getUserId();

  $scope.showSpinner = true;
  $scope.loggedInUser = user;

  let CONVERSATIONREF = firebase.database().ref('conversations');

  ConversationFactory.getAllConversationsForUser(user)
  .then((conversations)=> {
    conversations.forEach((conversation)=>{
      conversation.count = countUnreadMessages(conversation);
    });
    return $q.resolve(conversations);
  })
  .then((conversations)=> {
    conversations.selected = conversations[0];
    $scope.conversations = conversations;
    $scope.showSpinner = false;
  });

  CONVERSATIONREF.on('value', (snapshot)=> {
      let conversations = snapshot.val();
      if($scope.conversations){
        $scope.conversations.forEach((conversation, i)=> {
          for(var key in conversations){
            if((conversations[key].user1 === user || conversations[key].user2 === user) && key === conversation.id){
              conversations[key].id = key;
              $scope.conversations[i].messages = conversations[key].messages;
              $scope.conversations[i].count = countUnreadMessages(conversations[key]);
            }
          }
        });
      }
      updateListSelection();
  });

  $scope.scrollConvo = ()=> {
    updateListSelection();
  };

  //helper function to scroll conversations
  function updateListSelection() {
    $timeout(function(){
      let list = document.getElementsByClassName('chat');
      Array.from(list).forEach((convo, i) => {
        let liSelect = $(convo).children();
        let lastLi = $(liSelect).last().attr('id',`msg-${i}`);
        $(lastLi).prev().removeAttr('id');
        $anchorScroll(`msg-${i}`);
      });
    }, 0);
  }

  //helper function to count messages
  function countUnreadMessages(conversation) {
    let count = 0;
    conversation.messages.forEach((message)=> {
      if(message.authorId !== user && !message.read){
        count++;
      }
    });
    return count;
  }


  $scope.messageRead = (conversation, convoIndex)=> {
    let indexArray = [];
    conversation.messages.forEach((message, index)=> {
      if(message.authorId !== user){
        indexArray.push(index);
      }
    });
    ConversationFactory.updateRead(conversation.id, indexArray)
    .then(()=> {
      $scope.conversations[convoIndex].count = 0;
    });
  };

  $scope.otherUser = (users)=> {
    let correctUser = {};
    users.forEach((u)=> {
      if(u.userId !== user){
        correctUser.name = u.name;
        correctUser.photo = u.photo;
      }
    });
    return correctUser;
  };

  $scope.formatDate = (messageDate)=> {
    messageDate = moment(messageDate).startOf('minute').fromNow();
    return messageDate;
  };

  $scope.open = ()=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/messagesmodal.html',
      controller: 'MessagesModalCtrl'
    });
  };

  $scope.deleteConversation = (convoId)=> {
    ConversationFactory.deleteConversation(convoId)
    .then((results)=> {
      $route.reload();
    });
  };

  $scope.addMessage = (newMessage, conversation, index)=> {
    if(conversation.fullUsers[0].userId === user){
      ConversationFactory.addNewMessage(conversation.fullUsers[0], conversation.id, newMessage);
    } else {
      ConversationFactory.addNewMessage(conversation.fullUsers[1], conversation.id, newMessage);
    }
  };

}]);
;'use strict';

app.controller('MessagesModalCtrl', ['$scope', '$uibModalInstance', '$q', '$route', 'UserFactory', 'ConversationFactory', 'AuthFactory', function($scope, $uibModalInstance, $q, $route, UserFactory, ConversationFactory, AuthFactory){
  $scope.showSpinner = true;

  let loggedInUserId = AuthFactory.getUserId();
  let conversations = [];
  let users = [];

  ConversationFactory.getAllConversationsForUser(loggedInUserId)
  .then((conversationsPromise)=> {
    conversations = conversationsPromise;
    return UserFactory.getAllUsers();
  })
  .then((usersPromise)=> {
    $scope.users = [];
    //remove loggedin user from users
    users = usersPromise.filter((user) => loggedInUserId !== user.userId);
    //if no conversations, add all remaining users to scope
    if(conversations.length === 0){ return ($scope.users = users);}
    return $q.resolve();
  })
  .then(()=> {
    let addUser;
    //add users for starting conversation that no conversation exists
    users.forEach((user, i)=> {
      addUser = true;
      conversations.forEach((conversation)=> {
        if(user.userId === conversation.user1 || user.userId === conversation.user2){ addUser = false; }
      });

      $scope.users.forEach((scopeUser)=> {
        if(scopeUser.userId !== user.userId){
           return addUser;
        }
        addUser = false;
      });
      if(addUser){ $scope.users.push(user); }
    });
    $scope.showSpinner = false;
  });

  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };

  $scope.addConversation = ()=> {
    UserFactory.getUser(loggedInUserId)
    .then((user)=> {
      return $q((resolve, reject)=> {
      let conversation = {
        user1: user.userId,
        user2: $scope.selectedUser.userId,
        fullUsers: [user, $scope.selectedUser],
        messages: [{text: $scope.message, authorName: user.name, authorImg: user.photo, authorId: user.userId, read: false, date: new Date()}]
      };
      resolve(conversation);
      });
    })
    .then((conversation)=> {
      ConversationFactory.addConversation(conversation)
      .then(()=> {
        $route.reload();
      });
    });

    //closes the modal
    $uibModalInstance.close();
  };

}]);
;'use strict';

app.controller('ModalCtrl', ['$scope', '$uibModalInstance', '$route', 'isEditing', 'workshop', 'BundlesFactory', 'AuthFactory', 'WorkshopFactory', function($scope, $uibModalInstance, $route, isEditing, workshop, BundlesFactory, AuthFactory, WorkshopFactory){
  $scope.isEditing = isEditing;
  $scope.workshop = workshop;
  $scope.bundleSelected = workshop.bundleSelected;

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
        $uibModalInstance.close();
        $route.reload();
      });
  };

  //update workshop
  $scope.updateWorkshop = (workshop)=> {
    //saved as bundles in firebase so changing name
    workshop.bundles = workshop.bundleSelected;
    workshop.bundleSelected = null;
    WorkshopFactory.updateWorkshop(workshop, workshop.id)
    .then((response)=> {
      $uibModalInstance.close();
      $route.reload();
    });
  };

}]);
;'use strict';

app.controller('NavCtrl', ['$scope', '$window', '$location', '$q', 'AuthFactory', '$timeout', 'UserFactory', 'ConversationFactory', 'SearchService', function($scope, $window, $location, $q, AuthFactory, $timeout, UserFactory, ConversationFactory, SearchService) {

  let searchText = SearchService.getSearchText();
  $scope.search = {};
  $scope.search.text = searchText;

  $scope.$watch('search.text', function(newValue) {
    $scope.search.text = newValue;
    SearchService.setSearchText(newValue);
  });

  let CONVERSATIONREF = firebase.database().ref('conversations');

  CONVERSATIONREF.on('value', (snapshot)=> {
    UserFactory.getUser(AuthFactory.getUserId())
    .then((user) => {
      $scope.user = user;
      $scope.isButcher = user.isButcher;
      return $q.resolve(user);
    })
    .then((user)=> {
       return ConversationFactory.getAllConversationsForUser(user.userId);
    })
    .then((conversations)=> {
      let count = 0;
      conversations.forEach((conversation)=> {
        conversation.messages.forEach((message)=> {
          if(message.authorId !== $scope.user.userId && !message.read){
            count++;
          }
        });
      });
      $scope.count = count;
    });
  });

  // Logs out current user
  $scope.logout = () => {
    AuthFactory.logout()
    .then((logoutData) => {
      $window.location.href = '#/';
    });
  };

  firebase.auth().onAuthStateChanged(function(user) {
    $scope.isLoggedIn = AuthFactory.isAuthenticated();

    if($scope.isLoggedIn){
      UserFactory.getUser(AuthFactory.getUserId())
      .then((user) => {
        $scope.user = user;
        $scope.isButcher = user.isButcher;
        return $q.resolve(user);
      })
      .then((user)=> {
         return ConversationFactory.getAllConversationsForUser(user.userId);
      })
      .then((conversations)=> {
        let count = 0;
        conversations.forEach((conversation)=> {
          conversation.messages.forEach((message)=> {
            if(message.authorId !== $scope.user.userId && !message.read){
              count++;
            }
          });
        });
        $scope.count = count;
      });
    }
  });

}]);
;'use strict';

app.controller('SingleModalCtrl', ['$scope', '$uibModalInstance', '$routeParams', '$route', '$q', 'BundlesFactory', 'orderOptions', 'orders', 'isSpecialOrder', 'WorkshopFactory', function($scope, $uibModalInstance, $routeParams, $route, $q, BundlesFactory, orderOptions, orders, isSpecialOrder, WorkshopFactory){

  //adding list of bundles already added to workshop order
  const ordersAdded = orders.list.map(item => item.bundleName);
  $scope.orderOptions = orderOptions;

  $scope.checkAddOrdersAval = ()=> {
    orderOptions.bundles.forEach((bundle, index)=> {
      ordersAdded.forEach((bundleAdded)=> {
        if(bundle.name === bundleAdded && !isSpecialOrder){
          $scope.orderOptions.bundles[index].disable = true;
        }
        if(isSpecialOrder){
          $scope.orderOptions.bundles[index].disable = false;
        }
      });
    });
  };

  //scope items
  $scope.isSpecialOrder = isSpecialOrder;
  $scope.showMeals = false;


  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };

  $scope.getMeals = ()=> {
    let bundleId = $scope.selectedBundle.id;

    $scope.showMeals = true;

    $scope.$watch('showMeals', function(){
      BundlesFactory.getMeals(bundleId)
      .then((meals)=> {
        meals.sort((a,b)=> a.index - b.index);
        $scope.meals = meals;
      });
    });
  };

  $scope.addOrder = (meals, quantity)=> {

    //build order as newOrder
    let newOrder = {
      meals: meals,
      quantity: quantity,
      workshopId: $routeParams.workshopId,
      bundleName: $scope.selectedBundle.name,
      bundlePrice: $scope.selectedBundle.price,
      specialOrder: $scope.isSpecialOrder
    };

    WorkshopFactory.addOrder(newOrder)
    .then((result)=> {
      $uibModalInstance.close();
      $route.reload();
    });
  };

  $scope.checkAddOrdersAval();

}]);
;'use strict';

app.controller('TopCtrl', ($route, $window, $location, $scope)=>{
  firebase.auth().onAuthStateChanged(function(user){
    $scope.showSpinner = true;
    if (user){
      $location.path('/butcher');
    } else {
      $window.location.href = '#/login';
    }
  });
});
;'use strict';

app.controller('WorkshopCtrl', ['$scope', '$q', '$uibModal', '$route', '$location', 'WorkshopFactory', 'BundlesFactory', 'AuthFactory', 'SearchService', function($scope, $q, $uibModal, $route, $location, WorkshopFactory, BundlesFactory, AuthFactory, SearchService){
  const uid = AuthFactory.getUserId();
  let repWorkshops = [];

  $scope.showSpinner = true;

  //opens 'add new workshop' modal
  $scope.open = ()=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/workshopsmodal.html',
      controller: 'ModalCtrl',
      resolve: {
        workshop: {
          name: "",
          description: "",
          date: new Date(),
          time: ""
        },
        isEditing: false
      }
    });
  };

  //opens modal to edit workshop
  $scope.editWorkshop = (workshop)=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/workshopsmodal.html',
      controller: 'ModalCtrl',
      resolve :{
          workshop: {
            name: workshop.name,
            date: new Date(workshop.date),
            time: new Date(workshop.time),
            bundleSelected: workshop.bundles,
            id: workshop.id
          },
          isEditing: true
        }
    });
  };

  //deletes workshop
  $scope.deleteWorkshop = (workshopId)=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/deletemodal.html',
      controller: 'DeleteModalCtrl',
      resolve: { 
        workshop: {
          workshopId,
          isWorkshop: true
        }
      }
    });
  };

  //determines button functionality on workshop
  $scope.orderStatus = (workshop)=> {
    if(workshop.isSubmitted && !workshop.isApproved){
      $scope.orderBtn = 'ORDER PENDING';
      return true;
    } else if(workshop.isSubmitted && workshop.isApproved){
      $scope.orderBtn = 'ORDER APPROVED!';
      return true;
    }
  };

  $scope.submitOrder = (submitted, workshopId)=> {
    WorkshopFactory.updateWorkshop({'isSubmitted': true}, workshopId)
    .then((response)=> {
      $route.reload();
    });
  };

  //routes to orders view for workshop
  $scope.viewOrders = (workshopId)=> {
    $location.url(`/workshops/${workshopId}`);
  };

  //loads all user workshops to the view
  $scope.getWorkshops = ()=> {
    let keyArray = [];

    return WorkshopFactory.getWorkshops(uid)
      .then((workshops)=> {
        return $q((resolve, reject)=> {
          keyArray = Object.keys(workshops);
          keyArray.forEach((e) => {
            workshops[e].dateFormated = moment(workshops[e].date).format('MM/DD/YYYY');
            workshops[e].timeFormated = moment(workshops[e].time).format('hh:mma');
            workshops[e].isThisWeek = (moment(workshops[e].date) < moment().clone().startOf('week').add(7, 'day'));
            workshops[e].isExpired = (moment(workshops[e].date) < moment().add(1,'day').endOf('day'));
            repWorkshops.push(workshops[e]);
          });
          resolve(repWorkshops.sort((a, b) => new Date(a.date) - new Date(b.date)));
        });
      })
      .then((repWorkshops)=> {
        return $q((resolve, reject)=> {
          repWorkshops.forEach((workshop, index)=> {
            repWorkshops[index].totalCost = 0;

            WorkshopFactory.getOrders(workshop.id)
            .then((orders)=> {
              orders.forEach((order)=> {
                repWorkshops[index].totalCost += (order.bundlePrice * order.quantity);
              });
            });
          });
          resolve(repWorkshops);
        });
      })
      .then((repWorkshops)=> {
        return $q((resolve, reject)=> {
          $scope.repWorkshops = [];
          $scope.expiredWorkshop = [];
          repWorkshops.forEach((w) => {
            w.dateFormated >= moment(new Date()).format('MM/DD/YYYY') ? $scope.repWorkshops.push(w) : $scope.expiredWorkshop.push(w);
          });
          resolve();
        });
      })
      .then(()=> {
        $scope.showSpinner = false;
      });
    };

  function getMeals(bundles){
    return $q((resolve, reject)=> {
      const meals = [];
      bundles.forEach((bundle)=> {
        BundlesFactory.getMeals(bundle.bundleId)
        .then((bundleMeals)=> {
          Object.keys(bundleMeals).forEach(e => meals.push(bundleMeals[e]));
        });
      });
      resolve(meals);
    });
  }

  //bundle tool tip
  $scope.getBundleName = (bundles)=> {
    let bundle = ``;
     bundles.forEach((e, i)=> {
      bundle += `${i+1}) ${e.name} ($${e.price})`;
      if(i < bundles.length){
        bundle += `\n`;
      }
    });
    return bundle;
 };

 $scope.$watch(function () { return SearchService.getSearchText(); }, function (newValue, oldValue) {
       if (newValue !== null) {
           $scope.searchText= SearchService.getSearchText();
       }
   }, true);

}]);
;'use strict';

app.controller('WorkshopSingleCtrl', ['$scope', '$routeParams', '$route', '$q', '$uibModal', 'BundlesFactory', 'WorkshopFactory', 'AuthFactory', 'SearchService', function($scope, $routeParams, $route, $q, $uibModal, BundlesFactory, WorkshopFactory, AuthFactory, SearchService){

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

    $scope.deleteOrder = (orderId,index)=> {
      let modalInstance = $uibModal.open({
        templateUrl: '../partials/modals/deletemodal.html',
        controller: 'DeleteModalCtrl',
        resolve: { 
          workshop: { 
            orderId,
            index,
            orders: $scope.orders,
            custOrders: $scope.custOrders,
            isWorkshop: false
          } 
        }
      });
    };

    //get workshop
    WorkshopFactory.getWorkshops(AuthFactory.getUserId())
    .then((workshops)=> {
      return $q((resolve, reject)=> {
        $scope.workshop = workshops[$routeParams.workshopId];
        $scope.workshop.date = moment($scope.workshop.date).format('MM/DD/YYYY');
        $scope.workshop.time = moment($scope.workshop.time).format('hh:mma');
        $scope.isExpired = $scope.workshop.date < moment().add(2,'day').endOf('day').format('MM/DD/YYYY');
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

}]);
;'use strict';

app.directive('messages', function(){
  return {
    restrict: 'E',
    templateUrl: '..partials/directives/messages.html',
    replace: true,
    scope: {
    }
  };
});
;'use strict';

app.directive('onKeyEnter', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        element.bind('keydown keypress', function(event) {
            if (event.which === 13) {
                var attrValue = $parse(attrs.onKeyEnter);
                if(typeof attrValue === 'function'){
                   attrValue(scope);
                 } else {
                   angular.noop();
                 }
                event.preventDefault();
            }
        });
        scope.$on('$destroy', function() {
            element.unbind('keydown keypress');
        });
    }
  };
}]);
;'use strict';

app.factory('AuthFactory', ($q) => {

  var uid = null;

  let getUserId = () => {
    if(firebase.auth().currentUser){
      return firebase.auth().currentUser.uid;
    }
  };

  let createUser = (userObj) => {
    return firebase.auth().createUserWithEmailAndPassword(userObj.email, userObj.password)
    .catch(function(error) {
      let errorCode = error.code;
      let errorMessage = error.Message;
    });
  };

  let loginUserWithEmail = (userObj) => {
    return firebase.auth().signInWithEmailAndPassword(userObj.email, userObj.password)
    .then((userData) => {
      return $q.resolve(userData);
    })
    .catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.Message;
      console.error(errorCode, errorMessage);
    });
  };

  let loginUserWithGoogle = function(){
    let provider = new firebase.auth.GoogleAuthProvider();
      return firebase.auth().signInWithPopup(provider)
      .then((userData) => {
        return $q.resolve(userData);
      })
      .catch(function(error){
        console.error("Oops, there was an error logging in:", error);
    });
  };

  let loginUserWithFacebook = function(){
    let provider = new firebase.auth.FacebookAuthProvider();
      return firebase.auth().signInWithPopup(provider)
      .then((userData) => {
        return $q.resolve(userData);
      })
      .catch(function(error){
        console.error("Oops, there was an error logging in:", error);
    });
  };


  let logout = () => {
    return firebase.auth().signOut();
  };

  let isAuthenticated = () => (firebase.auth().currentUser) ? true : false;

  return {
    createUser,
    getUserId,
    isAuthenticated,
    loginUserWithEmail,
    loginUserWithGoogle,
    loginUserWithFacebook,
    logout
  };
});
;'use strict';

app.factory('BundlesFactory', ['$q', '$http', 'FirebaseURL', function($q, $http, FirebaseURL){


  //get bundles for workshop form
  const getBundles = ()=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}bundles.json`)
      .success((bundles)=> {
        resolve(bundles);
      })
      .error((error)=> {
        console.error('Could not get bundles: ', error);
        reject(error);
      });
    });
  };

  //get meals for a bundle
  const getMeals = (bundleId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}meals.json?orderBy="bundleId"&equalTo="${bundleId}"`)
      .success((meals)=> {
        let formatedMeals = [];
        for(var key in meals){
          formatedMeals.push(meals[key]);
        }
        resolve(formatedMeals);
      })
      .error((error)=> {
        console.error('Could not get meals: ', error);
        reject(error);
      });
    });
  };

  return {getBundles, getMeals};
}]);
;'use strict';

app.factory('ConversationFactory', ['$q', '$http', 'FirebaseURL', function($q, $http, FirebaseURL){

  let addConversation = (conversation)=> {
    return $q((resolve, reject)=> {
      $http.post(`${FirebaseURL}conversations.json`, angular.toJson(conversation))
      .success((response)=> {
        resolve();
      })
      .error((error)=> {
        console.error('Unable to add conversation to firebase: ', error);
      });
    });
  };

  let getAllConversations = ()=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}conversations.json`)
      .success((results)=> {
        let formatedConversations = [];
        for(var key in results){
          results[key].id = key;
          formatedConversations.push(results[key]);
        }
        resolve(formatedConversations);
      });
    });
  };

  let getConversationsForUser = (httpCall)=> {
    return $q((resolve, reject)=> {
      $http.get(httpCall)
      .success((results)=> {
        resolve(results);
      });
    });
  };

  let getAllConversationsForUser = (userId)=> {
    let getConvos = [`${FirebaseURL}conversations.json?orderBy="user1"&equalTo="${userId}"`, `${FirebaseURL}conversations.json?orderBy="user2"&equalTo="${userId}"`];
    return $q.all(
      getConvos.map((call)=> {
        return getConversationsForUser(call);
      }))
      .then((results)=> {
        let conversations = [];
        return $q((resolve, reject)=> {
          results.forEach((result) => {
            for(var key in result){
              result[key].id = key;
              conversations.push(result[key]);
            }
          });
          resolve(conversations);
        });
      });
  };

  let addNewMessage = (user, convoId, message)=> {
    let formatedMessage = {
      authorId: user.userId,
      authorImg: user.photo,
      authorName: user.name,
      date: new Date(),
      read: false,
      text: message
    };
    return getConversationsForUser(`${FirebaseURL}conversations/${convoId}.json`)
      .then((conversation)=> {
        conversation.messages.push(formatedMessage);
        return $q((resolve, reject)=> {
          $http.patch(`${FirebaseURL}conversations/${convoId}.json`, angular.toJson(conversation))
          .success((response)=> {
            resolve();
          })
          .error((error)=> {
            console.error('Unable to add message to firebase: ', error);
          });
        });

      });
  };

  let updateRead = (convoId, indexArray)=> {
    return getConversationsForUser(`${FirebaseURL}conversations/${convoId}.json`)
      .then((conversation)=> {
        indexArray.forEach(i => conversation.messages[i].read = true);
        return $q.resolve(conversation);
      })
      .then((conversation)=> {
        return $q((resolve, reject)=> {
          $http.patch(`${FirebaseURL}conversations/${convoId}.json`, angular.toJson(conversation))
          .success((response)=> {
            resolve();
          })
          .error((error)=> {
            console.error('Unable to update read value on conversation: ', error);
          });
        });
      });
  };

  let deleteConversation = (convoId)=> {
    return $q((resolve, reject)=> {
      $http.delete(`${FirebaseURL}conversations/${convoId}.json`)
      .success(()=> {
        resolve();
      })
      .error((error)=> {
        console.error('unable to delete conversation: ', error);
      });
    });
  };

  return {addConversation, getAllConversations, getConversationsForUser, getAllConversationsForUser, deleteConversation, addNewMessage, updateRead};

}]);
;'use strict';

app.factory('UserFactory', ['$http', '$q', 'FirebaseURL', function($http, $q, FirebaseURL){

  let getUser = (userId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}users.json?orderBy="userId"&equalTo="${userId}"`)
      .success((userData)=> {
        resolve(userData[Object.keys(userData)]);
      });
    });
  };

  let addUserToFirebaseDB = (userData, butcher)=> {
    let formatedUser = {
      name: userData.displayName,
      email: userData.email,
      photo: userData.photoURL,
      userId: userData.uid,
      isButcher: butcher.isButcher,
      butcherLocation: butcher.butcherLocation
    };

    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}users.json?orderBy="userId"&equalTo="${userData.uid}"`)
      .success((userData)=> {
        if(Object.keys(userData).length){
          console.log('userdata from success:', userData);
          formatedUser = userData[Object.keys(userData)[0]];
          console.log('user already exists. Not adding!', formatedUser);
          reject(formatedUser);
        }
        resolve(formatedUser);
      });
    })
    .then((formatedUser)=> {
      return $q((resolve, reject)=> {
        $http.post(`${FirebaseURL}users.json`, angular.toJson(formatedUser));
        resolve(formatedUser);
      });
    })
    .then((formatedUser)=> {
      console.log('user added to firebase successfully!', formatedUser);
    })
    .catch((formatedUser)=> {
      return $q((resolve, reject)=> {
        resolve(formatedUser);
      });
    });
  };

  let getAllUsers = ()=> {
    return $q((resolve, reject)=> {
        $http.get(`${FirebaseURL}users.json`)
        .success((users)=> {
          let formatedUsers = [];
          if(Object.keys(users).length){
            for(var user in users){
              formatedUsers.push(users[user]);
            }
          }
          resolve(formatedUsers);
        });
    });
  };

  return {addUserToFirebaseDB, getUser, getAllUsers};

}]);
;'use strict';

app.factory('WorkshopFactory', ['$q', '$http', 'FirebaseURL', function($q, $http, FirebaseURL){

  //workshop functions
  const getWorkshops = (userId)=> {

    const Url = userId ? `${FirebaseURL}workshops.json?orderBy="uid"&equalTo="${userId}"` : `${FirebaseURL}workshops.json?`;

    return $q((resolve, reject)=> {
      $http.get(Url)
      .success((workshops)=> {
        for(var key in workshops){ workshops[key].id = key; }
        resolve(workshops);
      })
      .error((error)=> {
        console.error('I was unable to get workshops for user: ', error);
        reject(error);
      });
    });
  };

  const postWorkshops = (workshop)=> {
    return $q((resolve, reject)=> {
      $http.post(`${FirebaseURL}workshops.json`, angular.toJson(workshop))
      .success((fbResult)=> {
        resolve(fbResult);
      })
      .error((error)=> {
        console.error('I was unable to save workshop data:', error);
        reject(error);
      });
    });
  };

  const updateWorkshop = (workshopObj, workshopId)=> {
    return $q((resolve, reject)=>{
      $http.patch(`${FirebaseURL}workshops/${workshopId}.json`, angular.toJson(workshopObj))
        .success((response)=>{
          resolve(response);
        })
        .error((error)=>{
          console.error('I was unable to update this workshop: ', error);
          reject(error);
        });
    });
  };

  const deleteOrder = (orderId)=> {
    return $q((resolve, reject)=> {
      $http.delete(`${FirebaseURL}orders/${orderId}.json`)
      .success((response)=> {
        resolve(response);
      })
      .error((error)=> {
        console.error('I was unable to delete the order: ', error);
        reject(error);
      });
    });
  };

  const deleteWorkshop = (workshopId) => {
    return $q((resolve, reject)=> {
      $http.delete(`${FirebaseURL}workshops/${workshopId}.json`)
        .success((response)=> {
          resolve(response);
        })
        .error((error)=> {
          console.error('I was unable to delete this workshop:', error);
        });
    })
    .then(()=> {
      let orders = [];
      return $q((resolve,reject)=> {
        $http.get(`${FirebaseURL}orders.json?orderBy="workshopId"&equalTo="${workshopId}"`)
        .success((orderObj)=> {
          Object.keys(orderObj).forEach((key)=> {
            orders.push(key);
          });
          resolve(orders);
        })
        .error((error)=> {
          console.error('Error getting orders for deleted workshop: ', error);
        });
      });
    })
    .then((orders)=> {
      return $q.all(
        orders.map((orderId)=> {
          return deleteOrder(orderId);
        })
      );
    })
    .then((response)=> {
      console.log('All orders for workshop deleted!', response);
    });
  };

  //order functions
  const getOrders = (workshopId)=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}orders.json?orderBy="workshopId"&equalTo="${workshopId}"`)
      .success((orders)=> {
        let formatedOrders = [];
        for(var key in orders){
          orders[key].id = key;
          formatedOrders.push(orders[key]);
        }
        resolve(formatedOrders);
      })
      .error((error)=> {
        console.error('I was unable to get orders for workshop: ', error);
        reject(error);
      });
    });
  };

  const addOrder = (order)=> {
    return $q((resolve, reject)=> {
      $http.post(`${FirebaseURL}orders.json`, angular.toJson(order))
      .success((fbResult)=> {
        resolve(fbResult);
      })
      .error((error)=> {
        console.error('I was unable to save this order:', error);
        reject(error);
      });
    });
  };

  const updateOrder = (orderObj, orderId)=> {
    return $q((resolve, reject)=>{
      $http.patch(`${FirebaseURL}orders/${orderId}.json`, JSON.stringify(orderObj))
        .success((updatedObj)=>{
          resolve(updatedObj);
        })
        .error((error)=>{
          console.error('I was unable to update this order: ', error);
          reject(error);
        });
    });
  };

  return {getWorkshops, postWorkshops, updateWorkshop, deleteWorkshop, getOrders, addOrder, updateOrder, deleteOrder};

}]);
;'use strict';

app.service('SearchService', function(){
  let searchText = '';

  let getSearchText = ()=> {
    return searchText;
  };

  let setSearchText = (value)=> {
    searchText = value;
    return searchText;
  };

  return {getSearchText, setSearchText};
});
;"use strict";

app.constant('FbCreds', {
    apiKey: "AIzaSyBBk_e30Gf4X4nk0UzmmnNz69EZkZEjoEw",
    authDomain: "wildtree-app-prod.firebaseapp.com",
    databaseURL: "https://wildtree-app-prod.firebaseio.com",
});

//  apiKey: "AIzaSyC4k95Gwfjf5q_8P7VsIN75YXq_oSwYIrQ",
//  authDomain: "wildtree-app.firebaseapp.com",
//  databaseURL: "https://wildtree-app.firebaseio.com"
