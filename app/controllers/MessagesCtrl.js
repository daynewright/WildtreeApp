'use strict';

app.controller('MessagesCtrl', function($scope, $routeParams, $q, $uibModal, $anchorScroll, $timeout, AuthFactory, ConversationFactory){
  let user = AuthFactory.getUserId();

  $scope.showSpinner = true;
  $scope.loggedInUser = user;

  let CONVERSATIONREF = firebase.database().ref('conversations');

  ConversationFactory.getAllConversationsForUser(user)
  .then((conversations)=> {
    console.log(conversations);
    conversations.forEach((conversation)=>{
      console.log('this: ', conversation);
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
      console.log('snapshot: ', snapshot.val());
      let conversations = snapshot.val();
      if($scope.conversations){
        $scope.conversations.forEach((conversation, i)=> {
          for(var key in conversations){
            if((conversations[key].user1 === user || conversations[key].user2 === user) && key === conversation.id){
              console.log('convo: ', conversations[key]);
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

  $scope.deleteConversation = ()=> {
    console.log('this will delete the conversation');
  };

  $scope.addMessage = (newMessage, conversation, index)=> {
    if(conversation.fullUsers[0].userId === user){
      ConversationFactory.addNewMessage(conversation.fullUsers[0], conversation.id, newMessage);
    } else {
      ConversationFactory.addNewMessage(conversation.fullUsers[1], conversation.id, newMessage);
    }
  };

});
