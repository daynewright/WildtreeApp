'use strict';

app.controller('MessagesCtrl', function($scope, $routeParams, $q, $uibModal, AuthFactory, ConversationFactory){
  let user = AuthFactory.getUserId();

  $scope.showSpinner = true;

  $scope.loggedInUser = user;

  ConversationFactory.getAllConversationsForUser(user)
  .then((conversations)=> {
    console.log(conversations);
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

  $scope.messageRead = (conversation, convoIndex)=> {
    let indexArray = [];
    conversation.messages.forEach((message, index)=> {
      if(message.authorId !== user){
        indexArray.push(index);
      }
    });
    console.log(conversation);

    ConversationFactory.updateRead(conversation.id, indexArray)
    .then(()=> {
      return ConversationFactory.getAllConversationsForUser(user);
    })
    .then((conversations)=> {
      console.log(conversations);
      conversations.selected = conversations[convoIndex];
        $scope.conversations = conversations;
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

  $scope.deleteConversation = ()=> {
    console.log('this will delete the conversation');
  };

  $scope.addMessage = (newMessage, conversation)=> {
    //this will add the message to FB and update view
    if(conversation.fullUsers[0].userId === user){
      ConversationFactory.addNewMessage(conversation.fullUsers[0], conversation.id, newMessage);
    } else {
      ConversationFactory.addNewMessage(conversation.fullUsers[1], conversation.id, newMessage);
    }
    console.log(newMessage);
  };

});
