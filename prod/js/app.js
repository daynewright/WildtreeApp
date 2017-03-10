'use strict';

var app = angular.module('MyApp', ['ngRoute', 'ui.bootstrap', 'multipleSelect', 'xeditable', 'angularSpinner', 'ngPrint']).constant('FirebaseURL', 'https://wildtree-app-prod.firebaseio.com/');

app.config(function ($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'partials/login.html',
    controller: 'LoginCtrl'
  }).when('/login', {
    templateUrl: 'partials/login.html',
    controller: 'LoginCtrl'
  }).when('/workshops', {
    templateUrl: 'partials/workshops.html',
    controller: 'WorkshopCtrl',
    rep: true
  }).when('/workshops/:workshopId', {
    templateUrl: 'partials/workshopsingle.html',
    controller: 'WorkshopSingleCtrl',
    rep: true
  }).when('/butcher', {
    templateUrl: 'partials/butchermain.html',
    controller: 'ButcherMainCtrl',
    butcher: true
  }).when('/messages', {
    templateUrl: 'partials/messages.html',
    controller: 'MessagesCtrl'
  }).when('/butcher/:orderId', {
    templateUrl: 'partials/butcherorder.html',
    controller: 'ButcherOrderCtrl',
    butcher: true
  }).otherwise('/login');
});

app.run(function (FbCreds, editableOptions, editableThemes) {
  firebase.initializeApp(FbCreds);
  editableOptions.theme = 'bs3';
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-sm';
});

app.run(function ($rootScope, $location, UserFactory, AuthFactory) {
  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    UserFactory.getUser(AuthFactory.getUserId()).then(function (user) {
      if (!user) {
        $location.path('/login');
      }

      if (next.$$route.butcher) {
        if (user && !user.isButcher) {
          $location.path('/workshops');
        }
      }
      if (next.$$route.rep) {
        if (user && user.isButcher) {
          $location.path('/butcher');
        }
      }
    });
  });
});

app.run(['$rootScope', '$location', function ($rootScope, $location) {
  $rootScope.$on('$routeChangeSuccess', function () {
    $rootScope.showSearch = $location.path() == "/workshops" || $location.path() === "/butcher";
  });
}]);
;'use strict';

app.controller('ButcherMainCtrl', ['$scope', '$window', '$q', '$route', '$uibModal', '$timeout', 'UserFactory', 'WorkshopFactory', 'BundlesFactory', 'SearchService', function ($scope, $window, $q, $route, $uibModal, $timeout, UserFactory, WorkshopFactory, BundlesFactory, SearchService) {
  var localStorageWorkshops = [];
  var users = [];

  WorkshopFactory.getWorkshops().then(function (workshops) {
    for (var workshop in workshops) {
      if (users.indexOf(workshops[workshop].uid) === -1) {
        users.push(workshops[workshop].uid);
      }
      if (workshops[workshop].isSubmitted && workshops[workshop].date >= moment(new Date()).format()) {
        localStorageWorkshops.push(workshops[workshop]);
      }
    }

    return $q.all(users.map(function (user) {
      return UserFactory.getUser(user);
    }));
  }).then(function (usersArray) {
    return $q(function (resolve, reject) {
      localStorageWorkshops.forEach(function (workshopOrder, i) {
        users.forEach(function (user, j) {
          if (localStorageWorkshops[i].uid === user) {
            localStorageWorkshops[i].customer = usersArray[j];
          }
        });
      });
      resolve(localStorageWorkshops);
    });
  }).then(function (submittedWorkshops) {
    return $q(function (resolve, reject) {
      submittedWorkshops.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      });
      submittedWorkshops.forEach(function (workshop) {
        workshop.dateFormated = moment(workshop.date).format('MM/DD/YYYY');
        workshop.timeFormated = moment(workshop.time).format('hh:mma');
        workshop.isThisWeek = moment(workshop.date) < moment().clone().startOf('week').add(7, 'day');
      });
      //move to bottom of chain
      resolve(submittedWorkshops);
    });
  }).then(function (submittedWorkshops) {
    return $q(function (resolve, reject) {
      submittedWorkshops.forEach(function (workshop, i) {
        var cost = 0;
        WorkshopFactory.getOrders(workshop.id).then(function (orders) {
          orders.forEach(function (order) {
            cost += order.bundlePrice * order.quantity;
          });
          submittedWorkshops[i].totalCost = cost.toFixed(2);
        });
      });
      resolve(submittedWorkshops);
    });
  }).then(function (submittedWorkshops) {
    $scope.workshopOrders = submittedWorkshops;
  });

  $scope.printOrder = function (workshop) {
    var modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/butcherordermodal.html',
      controller: 'ButcherOrderCtrl',
      size: 'lg',
      resolve: {
        workshop: workshop
      }
    });
  };

  $scope.approveWorkshop = function (workshopId) {
    WorkshopFactory.updateWorkshop({ isApproved: true }, workshopId).then(function () {
      $route.reload();
    });
  };

  $scope.deleteWorkshop = function (workshopId) {
    var modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/deletemodal.html',
      controller: 'DeleteModalCtrl',
      resolve: {
        workshop: {
          workshopId: workshopId,
          isWorkshop: true
        }
      }
    });
  };

  $scope.$watch(function () {
    return SearchService.getSearchText();
  }, function (newValue, oldValue) {
    if (newValue !== null) {
      $scope.searchText = SearchService.getSearchText();
    }
  }, true);
}]);
;'use strict';

app.controller('ButcherOrderCtrl', ['$scope', '$window', '$uibModalInstance', 'workshop', 'WorkshopFactory', function ($scope, $window, $uibModalInstance, workshop, WorkshopFactory) {

  $scope.showSpinner = true;

  WorkshopFactory.getOrders(workshop.id).then(function (orders) {
    $scope.orders = orders;
    $scope.ordersTotalQuantity = 0;
    orders.forEach(function (o) {
      return $scope.ordersTotalQuantity += o.quantity;
    });
    $scope.showSpinner = false;
  });

  $scope.workshop = workshop;

  //close modal
  $scope.close = function () {
    $uibModalInstance.close();
  };
}]);
;'use strict';

app.controller('DeleteModalCtrl', ['$scope', '$uibModalInstance', '$route', '$q', 'workshop', 'WorkshopFactory', function ($scope, $uibModalInstance, $route, $q, workshop, WorkshopFactory) {
  $scope.confirmDelete = function () {
    if (workshop.isWorkshop) {
      WorkshopFactory.deleteWorkshop(workshop.workshopId).then(function () {
        return $q(function (resolve, reject) {
          $uibModalInstance.close();
          resolve();
        });
      }).then(function () {
        return $route.reload();
      });
    } else {
      WorkshopFactory.deleteOrder(workshop.orderId).then(function () {
        return $q(function (resolve, reject) {
          if (workshop.orders[workshop.index] && workshop.orders[workshop.index].id == workshop.orderId) {
            workshop.orders.splice(workshop.index, 1);
          } else {
            workshop.custOrders.splice(workshop.index, 1);
          }
          resolve();
        });
      }).then(function () {
        return $uibModalInstance.close();
      });
    }
  };

  //close modal
  $scope.close = function () {
    $uibModalInstance.close();
  };
}]);;'use strict';

app.controller('LoginCtrl', ['$scope', 'AuthFactory', 'UserFactory', '$window', function ($scope, AuthFactory, UserFactory, $window) {
  $scope.account = {
    email: "",
    password: ""
  };

  $scope.loginWithEmailAndPassword = function () {
    AuthFactory.loginUserWithEmail($scope.account).then(function (data) {
      $window.location.href = '#/workshops';
    });
  };

  $scope.registerWithEmailAndPassword = function () {
    AuthFactory.createUser($scope.account).then(function (data) {
      AuthFactory.loginUserWithEmail($scope.account);
    });
  };

  $scope.loginWithGoogle = function () {
    AuthFactory.loginUserWithGoogle().then(function (userData) {
      if (userData) {
        UserFactory.addUserToFirebaseDB(userData.user, { isButcher: false, butcherLocation: null }).then(function (user) {
          if (user.isButcher) {
            $window.location.href = '#/butcher';
          } else {
            $window.location.href = '#/workshops';
          }
        });
      }
    });
  };

  $scope.loginWithFacebook = function () {
    AuthFactory.loginUserWithFacebook().then(function (userData) {
      if (userData) {
        UserFactory.addUserToFirebaseDB(userData.user, { isButcher: false, butcherLocation: null }).then(function (user) {
          if (user.isButcher) {
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

app.controller('MessagesCtrl', ['$scope', '$routeParams', '$q', '$uibModal', '$anchorScroll', '$timeout', '$route', 'AuthFactory', 'ConversationFactory', function ($scope, $routeParams, $q, $uibModal, $anchorScroll, $timeout, $route, AuthFactory, ConversationFactory) {
  var user = AuthFactory.getUserId();

  $scope.showSpinner = true;
  $scope.loggedInUser = user;

  var CONVERSATIONREF = firebase.database().ref('conversations');

  ConversationFactory.getAllConversationsForUser(user).then(function (conversations) {
    conversations.forEach(function (conversation) {
      conversation.count = countUnreadMessages(conversation);
    });
    return $q.resolve(conversations);
  }).then(function (conversations) {
    conversations.selected = conversations[0];
    $scope.conversations = conversations;
    $scope.showSpinner = false;
  });

  CONVERSATIONREF.on('value', function (snapshot) {
    var conversations = snapshot.val();
    if ($scope.conversations) {
      $scope.conversations.forEach(function (conversation, i) {
        for (var key in conversations) {
          if ((conversations[key].user1 === user || conversations[key].user2 === user) && key === conversation.id) {
            conversations[key].id = key;
            $scope.conversations[i].messages = conversations[key].messages;
            $scope.conversations[i].count = countUnreadMessages(conversations[key]);
          }
        }
      });
    }
    updateListSelection();
  });

  $scope.scrollConvo = function () {
    updateListSelection();
  };

  //helper function to scroll conversations
  function updateListSelection() {
    $timeout(function () {
      var list = document.getElementsByClassName('chat');
      Array.from(list).forEach(function (convo, i) {
        var liSelect = $(convo).children();
        var lastLi = $(liSelect).last().attr('id', 'msg-' + i);
        $(lastLi).prev().removeAttr('id');
        $anchorScroll('msg-' + i);
      });
    }, 0);
  }

  //helper function to count messages
  function countUnreadMessages(conversation) {
    var count = 0;
    conversation.messages.forEach(function (message) {
      if (message.authorId !== user && !message.read) {
        count++;
      }
    });
    return count;
  }

  $scope.messageRead = function (conversation, convoIndex) {
    var indexArray = [];
    conversation.messages.forEach(function (message, index) {
      if (message.authorId !== user) {
        indexArray.push(index);
      }
    });
    ConversationFactory.updateRead(conversation.id, indexArray).then(function () {
      $scope.conversations[convoIndex].count = 0;
    });
  };

  $scope.otherUser = function (users) {
    var correctUser = {};
    users.forEach(function (u) {
      if (u.userId !== user) {
        correctUser.name = u.name;
        correctUser.photo = u.photo;
      }
    });
    return correctUser;
  };

  $scope.formatDate = function (messageDate) {
    messageDate = moment(messageDate).startOf('minute').fromNow();
    return messageDate;
  };

  $scope.open = function () {
    var modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/messagesmodal.html',
      controller: 'MessagesModalCtrl'
    });
  };

  $scope.deleteConversation = function (convoId) {
    ConversationFactory.deleteConversation(convoId).then(function (results) {
      $route.reload();
    });
  };

  $scope.addMessage = function (newMessage, conversation, index) {
    if (conversation.fullUsers[0].userId === user) {
      ConversationFactory.addNewMessage(conversation.fullUsers[0], conversation.id, newMessage);
    } else {
      ConversationFactory.addNewMessage(conversation.fullUsers[1], conversation.id, newMessage);
    }
  };
}]);
;'use strict';

app.controller('MessagesModalCtrl', ['$scope', '$uibModalInstance', '$q', '$route', 'UserFactory', 'ConversationFactory', 'AuthFactory', function ($scope, $uibModalInstance, $q, $route, UserFactory, ConversationFactory, AuthFactory) {
  $scope.showSpinner = true;

  var loggedInUserId = AuthFactory.getUserId();
  var conversations = [];
  var users = [];

  ConversationFactory.getAllConversationsForUser(loggedInUserId).then(function (conversationsPromise) {
    conversations = conversationsPromise;
    return UserFactory.getAllUsers();
  }).then(function (usersPromise) {
    $scope.users = [];
    //remove loggedin user from users
    users = usersPromise.filter(function (user) {
      return loggedInUserId !== user.userId;
    });
    //if no conversations, add all remaining users to scope
    if (conversations.length === 0) {
      return $scope.users = users;
    }
    return $q.resolve();
  }).then(function () {
    var addUser = undefined;
    //add users for starting conversation that no conversation exists
    users.forEach(function (user, i) {
      addUser = true;
      conversations.forEach(function (conversation) {
        if (user.userId === conversation.user1 || user.userId === conversation.user2) {
          addUser = false;
        }
      });

      $scope.users.forEach(function (scopeUser) {
        if (scopeUser.userId !== user.userId) {
          return addUser;
        }
        addUser = false;
      });
      if (addUser) {
        $scope.users.push(user);
      }
    });
    $scope.showSpinner = false;
  });

  //close modal
  $scope.close = function () {
    $uibModalInstance.close();
  };

  $scope.addConversation = function () {
    UserFactory.getUser(loggedInUserId).then(function (user) {
      return $q(function (resolve, reject) {
        var conversation = {
          user1: user.userId,
          user2: $scope.selectedUser.userId,
          fullUsers: [user, $scope.selectedUser],
          messages: [{ text: $scope.message, authorName: user.name, authorImg: user.photo, authorId: user.userId, read: false, date: new Date() }]
        };
        resolve(conversation);
      });
    }).then(function (conversation) {
      ConversationFactory.addConversation(conversation).then(function () {
        $route.reload();
      });
    });

    //closes the modal
    $uibModalInstance.close();
  };
}]);
;'use strict';

app.controller('ModalCtrl', ['$scope', '$uibModalInstance', '$route', 'isEditing', 'workshop', 'BundlesFactory', 'AuthFactory', 'WorkshopFactory', function ($scope, $uibModalInstance, $route, isEditing, workshop, BundlesFactory, AuthFactory, WorkshopFactory) {
  $scope.isEditing = isEditing;
  $scope.workshop = workshop;
  $scope.bundleSelected = workshop.bundleSelected;

  var uid = AuthFactory.getUserId();

  //date selector
  $scope.clear = function () {
    $scope.workshop.date = null;
  };

  $scope.options = {
    minDate: new Date(),
    showWeeks: true,
    format: 'MM/d/yyyy'
  };

  $scope.datePickerOpened = false;

  $scope.openDatePicker = function () {
    $scope.datePickerOpened = true;
  };

  //bundle selector
  BundlesFactory.getBundles().then(function (bundles) {
    var bundleOptions = [];

    for (var key in bundles) {
      bundleOptions.push({
        'id': Object.keys(bundles).indexOf(key),
        'name': bundles[key].name,
        'bundleId': key,
        'price': bundles[key].price
      });
    }
    $scope.bundleOptions = bundleOptions;
  });

  //close modal
  $scope.close = function () {
    $uibModalInstance.close();
  };

  //save workshop
  $scope.addWorkshop = function () {
    var savedWorkshop = {
      'uid': uid,
      'name': $scope.workshop.name,
      'date': $scope.workshop.date,
      'time': $scope.workshop.time,
      'bundles': $scope.bundleSelected,
      'isApproved': false,
      'isSubmitted': false
    };

    WorkshopFactory.postWorkshops(savedWorkshop).then(function (success) {
      $uibModalInstance.close();
      $route.reload();
    });
  };

  //update workshop
  $scope.updateWorkshop = function (workshop) {
    //saved as bundles in firebase so changing name
    workshop.bundles = workshop.bundleSelected;
    workshop.bundleSelected = null;
    WorkshopFactory.updateWorkshop(workshop, workshop.id).then(function (response) {
      $uibModalInstance.close();
      $route.reload();
    });
  };
}]);
;'use strict';

app.controller('NavCtrl', ['$scope', '$window', '$location', '$q', 'AuthFactory', '$timeout', 'UserFactory', 'ConversationFactory', 'SearchService', function ($scope, $window, $location, $q, AuthFactory, $timeout, UserFactory, ConversationFactory, SearchService) {

  var searchText = SearchService.getSearchText();
  $scope.search = {};
  $scope.search.text = searchText;

  $scope.$watch('search.text', function (newValue) {
    $scope.search.text = newValue;
    SearchService.setSearchText(newValue);
  });

  var CONVERSATIONREF = firebase.database().ref('conversations');

  CONVERSATIONREF.on('value', function (snapshot) {
    UserFactory.getUser(AuthFactory.getUserId()).then(function (user) {
      $scope.user = user;
      $scope.isButcher = user.isButcher;
      return $q.resolve(user);
    }).then(function (user) {
      return ConversationFactory.getAllConversationsForUser(user.userId);
    }).then(function (conversations) {
      var count = 0;
      conversations.forEach(function (conversation) {
        conversation.messages.forEach(function (message) {
          if (message.authorId !== $scope.user.userId && !message.read) {
            count++;
          }
        });
      });
      $scope.count = count;
    });
  });

  // Logs out current user
  $scope.logout = function () {
    AuthFactory.logout().then(function (logoutData) {
      $window.location.href = '#/';
    });
  };

  firebase.auth().onAuthStateChanged(function (user) {
    $scope.isLoggedIn = AuthFactory.isAuthenticated();

    if ($scope.isLoggedIn) {
      UserFactory.getUser(AuthFactory.getUserId()).then(function (user) {
        $scope.user = user;
        $scope.isButcher = user.isButcher;
        return $q.resolve(user);
      }).then(function (user) {
        return ConversationFactory.getAllConversationsForUser(user.userId);
      }).then(function (conversations) {
        var count = 0;
        conversations.forEach(function (conversation) {
          conversation.messages.forEach(function (message) {
            if (message.authorId !== $scope.user.userId && !message.read) {
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

app.controller('SingleModalCtrl', ['$scope', '$uibModalInstance', '$routeParams', '$route', '$q', 'BundlesFactory', 'orderOptions', 'orders', 'isSpecialOrder', 'WorkshopFactory', function ($scope, $uibModalInstance, $routeParams, $route, $q, BundlesFactory, orderOptions, orders, isSpecialOrder, WorkshopFactory) {

  //adding list of bundles already added to workshop order
  var ordersAdded = orders.list.map(function (item) {
    return item.bundleName;
  });
  $scope.orderOptions = orderOptions;

  $scope.checkAddOrdersAval = function () {
    orderOptions.bundles.forEach(function (bundle, index) {
      ordersAdded.forEach(function (bundleAdded) {
        if (bundle.name === bundleAdded && !isSpecialOrder) {
          $scope.orderOptions.bundles[index].disable = true;
        }
        if (isSpecialOrder) {
          $scope.orderOptions.bundles[index].disable = false;
        }
      });
    });
  };

  //scope items
  $scope.isSpecialOrder = isSpecialOrder;
  $scope.showMeals = false;

  //close modal
  $scope.close = function () {
    $uibModalInstance.close();
  };

  $scope.getMeals = function () {
    var bundleId = $scope.selectedBundle.id;

    $scope.showMeals = true;

    $scope.$watch('showMeals', function () {
      BundlesFactory.getMeals(bundleId).then(function (meals) {
        meals.sort(function (a, b) {
          return a.index - b.index;
        });
        $scope.meals = meals;
      });
    });
  };

  $scope.addOrder = function (meals, quantity) {

    //build order as newOrder
    var newOrder = {
      meals: meals,
      quantity: quantity,
      workshopId: $routeParams.workshopId,
      bundleName: $scope.selectedBundle.name,
      bundlePrice: $scope.selectedBundle.price,
      specialOrder: $scope.isSpecialOrder
    };

    WorkshopFactory.addOrder(newOrder).then(function (result) {
      $uibModalInstance.close();
      $route.reload();
    });
  };

  $scope.checkAddOrdersAval();
}]);
;'use strict';

app.controller('TopCtrl', function ($route, $window, $location, $scope) {
  firebase.auth().onAuthStateChanged(function (user) {
    $scope.showSpinner = true;
    if (user) {
      $location.path('/butcher');
    } else {
      $window.location.href = '#/login';
    }
  });
});
;'use strict';

app.controller('WorkshopCtrl', ['$scope', '$q', '$uibModal', '$route', '$location', 'WorkshopFactory', 'BundlesFactory', 'AuthFactory', 'SearchService', function ($scope, $q, $uibModal, $route, $location, WorkshopFactory, BundlesFactory, AuthFactory, SearchService) {
  var uid = AuthFactory.getUserId();
  var repWorkshops = [];

  $scope.showSpinner = true;

  //opens 'add new workshop' modal
  $scope.open = function () {
    var modalInstance = $uibModal.open({
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
  $scope.editWorkshop = function (workshop) {
    var modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/workshopsmodal.html',
      controller: 'ModalCtrl',
      resolve: {
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
  $scope.deleteWorkshop = function (workshopId) {
    var modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/deletemodal.html',
      controller: 'DeleteModalCtrl',
      resolve: {
        workshop: {
          workshopId: workshopId,
          isWorkshop: true
        }
      }
    });
  };

  //determines button functionality on workshop
  $scope.orderStatus = function (workshop) {
    if (workshop.isSubmitted && !workshop.isApproved) {
      $scope.orderBtn = 'ORDER PENDING';
      return true;
    } else if (workshop.isSubmitted && workshop.isApproved) {
      $scope.orderBtn = 'ORDER APPROVED!';
      return true;
    }
  };

  $scope.submitOrder = function (submitted, workshopId) {
    WorkshopFactory.updateWorkshop({ 'isSubmitted': true }, workshopId).then(function (response) {
      $route.reload();
    });
  };

  //routes to orders view for workshop
  $scope.viewOrders = function (workshopId) {
    $location.url('/workshops/' + workshopId);
  };

  //loads all user workshops to the view
  $scope.getWorkshops = function () {
    var keyArray = [];

    return WorkshopFactory.getWorkshops(uid).then(function (workshops) {
      return $q(function (resolve, reject) {
        keyArray = Object.keys(workshops);
        keyArray.forEach(function (e) {
          workshops[e].dateFormated = moment(workshops[e].date).format('MM/DD/YYYY');
          workshops[e].timeFormated = moment(workshops[e].time).format('hh:mma');
          workshops[e].isThisWeek = moment(workshops[e].date) < moment().clone().startOf('week').add(7, 'day');
          workshops[e].isExpired = moment(workshops[e].date) < moment().add(1, 'day').endOf('day');
          repWorkshops.push(workshops[e]);
        });
        resolve(repWorkshops.sort(function (a, b) {
          return new Date(a.date) - new Date(b.date);
        }));
      });
    }).then(function (repWorkshops) {
      return $q(function (resolve, reject) {
        repWorkshops.forEach(function (workshop, index) {
          repWorkshops[index].totalCost = 0;

          WorkshopFactory.getOrders(workshop.id).then(function (orders) {
            orders.forEach(function (order) {
              repWorkshops[index].totalCost += order.bundlePrice * order.quantity;
            });
          });
        });
        resolve(repWorkshops);
      });
    }).then(function (repWorkshops) {
      return $q(function (resolve, reject) {
        $scope.repWorkshops = [];
        $scope.expiredWorkshop = [];
        repWorkshops.forEach(function (w) {
          w.dateFormated >= moment(new Date()).format('MM/DD/YYYY') ? $scope.repWorkshops.push(w) : $scope.expiredWorkshop.push(w);
        });
        resolve();
      });
    }).then(function () {
      $scope.showSpinner = false;
    });
  };

  function getMeals(bundles) {
    return $q(function (resolve, reject) {
      var meals = [];
      bundles.forEach(function (bundle) {
        BundlesFactory.getMeals(bundle.bundleId).then(function (bundleMeals) {
          Object.keys(bundleMeals).forEach(function (e) {
            return meals.push(bundleMeals[e]);
          });
        });
      });
      resolve(meals);
    });
  }

  //bundle tool tip
  $scope.getBundleName = function (bundles) {
    var bundle = '';
    bundles.forEach(function (e, i) {
      bundle += i + 1 + ') ' + e.name + ' ($' + e.price + ')';
      if (i < bundles.length) {
        bundle += '\n';
      }
    });
    return bundle;
  };

  $scope.$watch(function () {
    return SearchService.getSearchText();
  }, function (newValue, oldValue) {
    if (newValue !== null) {
      $scope.searchText = SearchService.getSearchText();
    }
  }, true);
}]);
;'use strict';

app.controller('WorkshopSingleCtrl', ['$scope', '$routeParams', '$route', '$q', '$uibModal', 'BundlesFactory', 'WorkshopFactory', 'AuthFactory', 'SearchService', function ($scope, $routeParams, $route, $q, $uibModal, BundlesFactory, WorkshopFactory, AuthFactory, SearchService) {

  var orderBundles = [];

  $scope.totalBundles = 0;
  $scope.totalCost = 0;
  $scope.showSpinner = true;

  $scope.open = function (isSpecialOrder) {
    var modalInstance = $uibModal.open({
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
        isSpecialOrder: isSpecialOrder
      }
    });
  };

  $scope.totalBundlesOrdered = function () {
    var totalBundles = 0;
    $scope.orders.forEach(function (order) {
      return totalBundles += parseInt(order.quantity);
    });
    $scope.custOrders.forEach(function (order) {
      return totalBundles += parseInt(order.quantity);
    });

    return totalBundles;
  };

  $scope.totalCostOrdered = function () {
    var totalCost = 0;
    $scope.orders.forEach(function (order) {
      return totalCost += parseFloat(order.bundlePrice) * parseInt(order.quantity);
    });
    $scope.custOrders.forEach(function (order) {
      return totalCost += parseFloat(order.bundlePrice) * parseInt(order.quantity);
    });

    return totalCost.toFixed(2);
  };

  $scope.deleteOrder = function (orderId, index) {
    var modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/deletemodal.html',
      controller: 'DeleteModalCtrl',
      resolve: {
        workshop: {
          orderId: orderId,
          index: index,
          orders: $scope.orders,
          custOrders: $scope.custOrders,
          isWorkshop: false
        }
      }
    });
  };

  //get workshop
  WorkshopFactory.getWorkshops(AuthFactory.getUserId()).then(function (workshops) {
    return $q(function (resolve, reject) {
      $scope.workshop = workshops[$routeParams.workshopId];
      $scope.workshop.date = moment($scope.workshop.date).format('MM/DD/YYYY');
      $scope.workshop.time = moment($scope.workshop.time).format('hh:mma');
      $scope.isExpired = $scope.workshop.date < moment().add(2, 'day').endOf('day').format('MM/DD/YYYY');
      resolve(workshops);
    });
  }).then(function (workshops) {
    return $q.all(workshops[$routeParams.workshopId].bundles.map(function (bundle) {
      return { 'name': bundle.name, 'price': bundle.price, 'id': bundle.bundleId };
    }));
  }).then(function (bundles) {
    orderBundles = bundles;
  });

  //get orders
  WorkshopFactory.getOrders($routeParams.workshopId).then(function (orders) {
    return $q(function (resolve, reject) {
      $scope.orders = orders.filter(function (order) {
        return !order.specialOrder;
      });
      $scope.custOrders = orders.filter(function (order) {
        return order.specialOrder;
      });
      resolve();
    });
  }).then(function () {
    return $q(function (resolve, reject) {
      $scope.orders.forEach(function (order, index) {
        if (order.quantity) {
          $scope.$watch('orders[' + index + ']', watchQty, true);
        }
      });

      $scope.custOrders.forEach(function (order, index) {
        if (order.quantity) {
          $scope.$watch('custOrders[' + index + ']', watchQty, true);
        }
      });

      resolve();
    });
  }).then(function () {
    $scope.showSpinner = false;
  });

  function watchQty(val, oldVal, scope) {
    if (val !== oldVal) {
      if (val && parseInt(val.quantity)) {
        WorkshopFactory.updateOrder({ quantity: parseInt(val.quantity) }, val.id).then(function () {
          scope.orders.forEach(function (order, i) {
            if (order.id === val.id) {
              $scope.orders[i].quantity = val.quantity;
            }
          });
          scope.custOrders.forEach(function (order, i) {
            if (order.id === val.id) {
              $scope.custOrders[i].quantity = val.quantity;
            }
          });
        });
      } else {
        console.log('Number was not entered.  Not patching Firebase.');
      }
    }
  }

  $scope.$watch(function () {
    return SearchService.getSearchText();
  }, function (newValue, oldValue) {
    if (newValue !== null) {
      $scope.searchText = SearchService.getSearchText();
    }
  }, true);
}]);
;'use strict';

app.directive('messages', function () {
  return {
    restrict: 'E',
    templateUrl: '..partials/directives/messages.html',
    replace: true,
    scope: {}
  };
});
;'use strict';

app.directive('onKeyEnter', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function link(scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          var attrValue = $parse(attrs.onKeyEnter);
          if (typeof attrValue === 'function') {
            attrValue(scope);
          } else {
            angular.noop();
          }
          event.preventDefault();
        }
      });
      scope.$on('$destroy', function () {
        element.unbind('keydown keypress');
      });
    }
  };
}]);
;'use strict';

app.factory('AuthFactory', function ($q) {

  var uid = null;

  var getUserId = function getUserId() {
    if (firebase.auth().currentUser) {
      return firebase.auth().currentUser.uid;
    }
  };

  var createUser = function createUser(userObj) {
    return firebase.auth().createUserWithEmailAndPassword(userObj.email, userObj.password)['catch'](function (error) {
      var errorCode = error.code;
      var errorMessage = error.Message;
    });
  };

  var loginUserWithEmail = function loginUserWithEmail(userObj) {
    return firebase.auth().signInWithEmailAndPassword(userObj.email, userObj.password).then(function (userData) {
      return $q.resolve(userData);
    })['catch'](function (error) {
      var errorCode = error.code;
      var errorMessage = error.Message;
      console.error(errorCode, errorMessage);
    });
  };

  var loginUserWithGoogle = function loginUserWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider).then(function (userData) {
      return $q.resolve(userData);
    })['catch'](function (error) {
      console.error("Oops, there was an error logging in:", error);
    });
  };

  var loginUserWithFacebook = function loginUserWithFacebook() {
    var provider = new firebase.auth.FacebookAuthProvider();
    return firebase.auth().signInWithPopup(provider).then(function (userData) {
      return $q.resolve(userData);
    })['catch'](function (error) {
      console.error("Oops, there was an error logging in:", error);
    });
  };

  var logout = function logout() {
    return firebase.auth().signOut();
  };

  var isAuthenticated = function isAuthenticated() {
    return firebase.auth().currentUser ? true : false;
  };

  return {
    createUser: createUser,
    getUserId: getUserId,
    isAuthenticated: isAuthenticated,
    loginUserWithEmail: loginUserWithEmail,
    loginUserWithGoogle: loginUserWithGoogle,
    loginUserWithFacebook: loginUserWithFacebook,
    logout: logout
  };
});
;'use strict';

app.factory('BundlesFactory', ['$q', '$http', 'FirebaseURL', function ($q, $http, FirebaseURL) {

  //get bundles for workshop form
  var getBundles = function getBundles() {
    return $q(function (resolve, reject) {
      $http.get(FirebaseURL + 'bundles.json').success(function (bundles) {
        resolve(bundles);
      }).error(function (error) {
        console.error('Could not get bundles: ', error);
        reject(error);
      });
    });
  };

  //get meals for a bundle
  var getMeals = function getMeals(bundleId) {
    return $q(function (resolve, reject) {
      $http.get(FirebaseURL + 'meals.json?orderBy="bundleId"&equalTo="' + bundleId + '"').success(function (meals) {
        var formatedMeals = [];
        for (var key in meals) {
          formatedMeals.push(meals[key]);
        }
        resolve(formatedMeals);
      }).error(function (error) {
        console.error('Could not get meals: ', error);
        reject(error);
      });
    });
  };

  return { getBundles: getBundles, getMeals: getMeals };
}]);
;'use strict';

app.factory('ConversationFactory', ['$q', '$http', 'FirebaseURL', function ($q, $http, FirebaseURL) {

  var addConversation = function addConversation(conversation) {
    return $q(function (resolve, reject) {
      $http.post(FirebaseURL + 'conversations.json', angular.toJson(conversation)).success(function (response) {
        resolve();
      }).error(function (error) {
        console.error('Unable to add conversation to firebase: ', error);
      });
    });
  };

  var getAllConversations = function getAllConversations() {
    return $q(function (resolve, reject) {
      $http.get(FirebaseURL + 'conversations.json').success(function (results) {
        var formatedConversations = [];
        for (var key in results) {
          results[key].id = key;
          formatedConversations.push(results[key]);
        }
        resolve(formatedConversations);
      });
    });
  };

  var getConversationsForUser = function getConversationsForUser(httpCall) {
    return $q(function (resolve, reject) {
      $http.get(httpCall).success(function (results) {
        resolve(results);
      });
    });
  };

  var getAllConversationsForUser = function getAllConversationsForUser(userId) {
    var getConvos = [FirebaseURL + 'conversations.json?orderBy="user1"&equalTo="' + userId + '"', FirebaseURL + 'conversations.json?orderBy="user2"&equalTo="' + userId + '"'];
    return $q.all(getConvos.map(function (call) {
      return getConversationsForUser(call);
    })).then(function (results) {
      var conversations = [];
      return $q(function (resolve, reject) {
        results.forEach(function (result) {
          for (var key in result) {
            result[key].id = key;
            conversations.push(result[key]);
          }
        });
        resolve(conversations);
      });
    });
  };

  var addNewMessage = function addNewMessage(user, convoId, message) {
    var formatedMessage = {
      authorId: user.userId,
      authorImg: user.photo,
      authorName: user.name,
      date: new Date(),
      read: false,
      text: message
    };
    return getConversationsForUser(FirebaseURL + 'conversations/' + convoId + '.json').then(function (conversation) {
      conversation.messages.push(formatedMessage);
      return $q(function (resolve, reject) {
        $http.patch(FirebaseURL + 'conversations/' + convoId + '.json', angular.toJson(conversation)).success(function (response) {
          resolve();
        }).error(function (error) {
          console.error('Unable to add message to firebase: ', error);
        });
      });
    });
  };

  var updateRead = function updateRead(convoId, indexArray) {
    return getConversationsForUser(FirebaseURL + 'conversations/' + convoId + '.json').then(function (conversation) {
      indexArray.forEach(function (i) {
        return conversation.messages[i].read = true;
      });
      return $q.resolve(conversation);
    }).then(function (conversation) {
      return $q(function (resolve, reject) {
        $http.patch(FirebaseURL + 'conversations/' + convoId + '.json', angular.toJson(conversation)).success(function (response) {
          resolve();
        }).error(function (error) {
          console.error('Unable to update read value on conversation: ', error);
        });
      });
    });
  };

  var deleteConversation = function deleteConversation(convoId) {
    return $q(function (resolve, reject) {
      $http['delete'](FirebaseURL + 'conversations/' + convoId + '.json').success(function () {
        resolve();
      }).error(function (error) {
        console.error('unable to delete conversation: ', error);
      });
    });
  };

  return { addConversation: addConversation, getAllConversations: getAllConversations, getConversationsForUser: getConversationsForUser, getAllConversationsForUser: getAllConversationsForUser, deleteConversation: deleteConversation, addNewMessage: addNewMessage, updateRead: updateRead };
}]);
;'use strict';

app.factory('UserFactory', ['$http', '$q', 'FirebaseURL', function ($http, $q, FirebaseURL) {

  var getUser = function getUser(userId) {
    return $q(function (resolve, reject) {
      $http.get(FirebaseURL + 'users.json?orderBy="userId"&equalTo="' + userId + '"').success(function (userData) {
        resolve(userData[Object.keys(userData)]);
      });
    });
  };

  var addUserToFirebaseDB = function addUserToFirebaseDB(userData, butcher) {
    var formatedUser = {
      name: userData.displayName,
      email: userData.email,
      photo: userData.photoURL,
      userId: userData.uid,
      isButcher: butcher.isButcher,
      butcherLocation: butcher.butcherLocation
    };

    return $q(function (resolve, reject) {
      $http.get(FirebaseURL + 'users.json?orderBy="userId"&equalTo="' + userData.uid + '"').success(function (userData) {
        if (Object.keys(userData).length) {
          console.log('userdata from success:', userData);
          formatedUser = userData[Object.keys(userData)[0]];
          console.log('user already exists. Not adding!', formatedUser);
          reject(formatedUser);
        }
        resolve(formatedUser);
      });
    }).then(function (formatedUser) {
      return $q(function (resolve, reject) {
        $http.post(FirebaseURL + 'users.json', angular.toJson(formatedUser));
        resolve(formatedUser);
      });
    }).then(function (formatedUser) {
      console.log('user added to firebase successfully!', formatedUser);
    })['catch'](function (formatedUser) {
      return $q(function (resolve, reject) {
        resolve(formatedUser);
      });
    });
  };

  var getAllUsers = function getAllUsers() {
    return $q(function (resolve, reject) {
      $http.get(FirebaseURL + 'users.json').success(function (users) {
        var formatedUsers = [];
        if (Object.keys(users).length) {
          for (var user in users) {
            formatedUsers.push(users[user]);
          }
        }
        resolve(formatedUsers);
      });
    });
  };

  return { addUserToFirebaseDB: addUserToFirebaseDB, getUser: getUser, getAllUsers: getAllUsers };
}]);
;'use strict';

app.factory('WorkshopFactory', ['$q', '$http', 'FirebaseURL', function ($q, $http, FirebaseURL) {

  //workshop functions
  var getWorkshops = function getWorkshops(userId) {

    var Url = userId ? FirebaseURL + 'workshops.json?orderBy="uid"&equalTo="' + userId + '"' : FirebaseURL + 'workshops.json?';

    return $q(function (resolve, reject) {
      $http.get(Url).success(function (workshops) {
        for (var key in workshops) {
          workshops[key].id = key;
        }
        resolve(workshops);
      }).error(function (error) {
        console.error('I was unable to get workshops for user: ', error);
        reject(error);
      });
    });
  };

  var postWorkshops = function postWorkshops(workshop) {
    return $q(function (resolve, reject) {
      $http.post(FirebaseURL + 'workshops.json', angular.toJson(workshop)).success(function (fbResult) {
        resolve(fbResult);
      }).error(function (error) {
        console.error('I was unable to save workshop data:', error);
        reject(error);
      });
    });
  };

  var updateWorkshop = function updateWorkshop(workshopObj, workshopId) {
    return $q(function (resolve, reject) {
      $http.patch(FirebaseURL + 'workshops/' + workshopId + '.json', angular.toJson(workshopObj)).success(function (response) {
        resolve(response);
      }).error(function (error) {
        console.error('I was unable to update this workshop: ', error);
        reject(error);
      });
    });
  };

  var deleteOrder = function deleteOrder(orderId) {
    return $q(function (resolve, reject) {
      $http['delete'](FirebaseURL + 'orders/' + orderId + '.json').success(function (response) {
        resolve(response);
      }).error(function (error) {
        console.error('I was unable to delete the order: ', error);
        reject(error);
      });
    });
  };

  var deleteWorkshop = function deleteWorkshop(workshopId) {
    return $q(function (resolve, reject) {
      $http['delete'](FirebaseURL + 'workshops/' + workshopId + '.json').success(function (response) {
        resolve(response);
      }).error(function (error) {
        console.error('I was unable to delete this workshop:', error);
      });
    }).then(function () {
      var orders = [];
      return $q(function (resolve, reject) {
        $http.get(FirebaseURL + 'orders.json?orderBy="workshopId"&equalTo="' + workshopId + '"').success(function (orderObj) {
          Object.keys(orderObj).forEach(function (key) {
            orders.push(key);
          });
          resolve(orders);
        }).error(function (error) {
          console.error('Error getting orders for deleted workshop: ', error);
        });
      });
    }).then(function (orders) {
      return $q.all(orders.map(function (orderId) {
        return deleteOrder(orderId);
      }));
    }).then(function (response) {
      console.log('All orders for workshop deleted!', response);
    });
  };

  //order functions
  var getOrders = function getOrders(workshopId) {
    return $q(function (resolve, reject) {
      $http.get(FirebaseURL + 'orders.json?orderBy="workshopId"&equalTo="' + workshopId + '"').success(function (orders) {
        var formatedOrders = [];
        for (var key in orders) {
          orders[key].id = key;
          formatedOrders.push(orders[key]);
        }
        resolve(formatedOrders);
      }).error(function (error) {
        console.error('I was unable to get orders for workshop: ', error);
        reject(error);
      });
    });
  };

  var addOrder = function addOrder(order) {
    return $q(function (resolve, reject) {
      $http.post(FirebaseURL + 'orders.json', angular.toJson(order)).success(function (fbResult) {
        resolve(fbResult);
      }).error(function (error) {
        console.error('I was unable to save this order:', error);
        reject(error);
      });
    });
  };

  var updateOrder = function updateOrder(orderObj, orderId) {
    return $q(function (resolve, reject) {
      $http.patch(FirebaseURL + 'orders/' + orderId + '.json', JSON.stringify(orderObj)).success(function (updatedObj) {
        resolve(updatedObj);
      }).error(function (error) {
        console.error('I was unable to update this order: ', error);
        reject(error);
      });
    });
  };

  return { getWorkshops: getWorkshops, postWorkshops: postWorkshops, updateWorkshop: updateWorkshop, deleteWorkshop: deleteWorkshop, getOrders: getOrders, addOrder: addOrder, updateOrder: updateOrder, deleteOrder: deleteOrder };
}]);
;'use strict';

app.service('SearchService', function () {
  var searchText = '';

  var getSearchText = function getSearchText() {
    return searchText;
  };

  var setSearchText = function setSearchText(value) {
    searchText = value;
    return searchText;
  };

  return { getSearchText: getSearchText, setSearchText: setSearchText };
});
;"use strict";

app.constant('FbCreds', {
  apiKey: "AIzaSyBBk_e30Gf4X4nk0UzmmnNz69EZkZEjoEw",
  authDomain: "wildtree-app-prod.firebaseapp.com",
  databaseURL: "https://wildtree-app-prod.firebaseio.com"
});

//  apiKey: "AIzaSyC4k95Gwfjf5q_8P7VsIN75YXq_oSwYIrQ",
//  authDomain: "wildtree-app.firebaseapp.com",
//  databaseURL: "https://wildtree-app.firebaseio.com"
