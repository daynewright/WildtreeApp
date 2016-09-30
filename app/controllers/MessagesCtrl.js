'use strict';

app.controller('MessagesCtrl', function($scope, $routeParams, $q, $uibModal, AuthFactory, ConversationFactory){

  $scope.showSpinner = true;

  ConversationFactory.getAllConversationsForUser(AuthFactory.getUserId())
  .then((conversations)=> {
    conversations.selected = conversations[0];
    $scope.conversations = conversations;
    $scope.showSpinner = false;
  });

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
