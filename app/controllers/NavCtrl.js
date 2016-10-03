'use strict';

app.controller('NavCtrl', function($scope, $window, $location, $q, AuthFactory, $timeout, UserFactory, ConversationFactory, SearchService) {

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
      console.log('Logged out', logoutData);
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

});
