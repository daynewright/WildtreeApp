'use strict';

app.controller('MessagesCtrl', function($scope, $routeParams, $q, $uibModal, AuthFactory){

  $("div.messages-tab-menu>div.list-group>a").click(function(e) {
    e.preventDefault();
    $(this).siblings('a.active').removeClass("active");
    $(this).addClass("active");
    var index = $(this).index();
    $("div.messages-tab>div.messages-tab-content").removeClass("active");
    $("div.messages-tab>div.messages-tab-content").eq(index).addClass("active");
  });

  $scope.open = ()=> {
    let modalInstance = $uibModal.open({
      templateUrl: '../partials/modals/messagesmodal.html',
      controller: 'MessagesModalCtrl'
    });
  };

  $scope.conversations = ()=> {
    // this will be an array of all current conversations
  };

  $scope.deleteConversation = ()=> {
    //this will delete a conversation record
  };

  $scope.addMessage = (newMessage)=> {
    //this will add the message to FB and update view
    console.log(newMessage);
    $scope.newMessage = '';
  };

  $scope.conversation = [
    {
      displayName: 'Dayne Wright',
      date: "Sept. 25, 2016 1:15pm",
      photo: "http://placehold.it/50/FA6F57/fff&text=DW",
      message: "This is an awesome amazing message! This is an awesome amazing message! This is an awesome amazing message!"
    }
  ];

});
