'use strict';

app.controller('MessagesCtrl', function($scope, $routeParams, $q, $uibModal, AuthFactory, ConversationFactory){
  let user = AuthFactory.getUserId();

  $scope.showSpinner = true;

  $scope.loggedInUser = user;

  ConversationFactory.getAllConversationsForUser(user)
  .then((conversations)=> {
    conversations.selected = conversations[0];
    $scope.conversations = conversations;
    $scope.showSpinner = false;
  });

  $scope.unreadCount = (conversation)=> {
    let count = 0;
    conversation.messages.forEach((message) => {
      if(message.authorId !== user && !message.read){
        count++;
      }
    });
    return count;
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

  $scope.deleteConversation = ()=> {
    console.log('this will delete the conversation');
  };

  $scope.addMessage = (newMessage)=> {
    //this will add the message to FB and update view
    console.log(newMessage);
    $scope.newMessage = '';
  };

});
