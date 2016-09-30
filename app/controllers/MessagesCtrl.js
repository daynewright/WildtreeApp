'use strict';

app.controller('MessagesCtrl', function($scope, $routeParams, $q, $uibModal, AuthFactory, ConversationFactory){


  $("div.messages-tab-menu>div.list-group>a").click(function(e) {
    e.preventDefault();
    $(this).siblings('a.active').removeClass("active");
    $(this).addClass("active");
    var index = $(this).index();
    $("div.messages-tab>div.messages-tab-content").removeClass("active");
    $("div.messages-tab>div.messages-tab-content").eq(index).addClass("active");
  });


  ConversationFactory.getAllConversationsForUser(AuthFactory.getUserId())
  .then((conversations)=> {
    $scope.conversations = conversations;
  });


  $scope.formatDate = (messageDate)=> {
    messageDate = moment(messageDate).startOf('hour').fromNow();
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
