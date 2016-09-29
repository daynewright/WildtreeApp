'use strict';

app.controller('MessagesModalCtrl', function($scope, $uibModalInstance, $q, UserFactory, ConversationFactory, AuthFactory){

  let loggedInUserId = AuthFactory.getUserId();

  UserFactory.getAllUsers()
  .then((users)=> {
    $scope.users = users.filter((user)=> loggedInUserId !== user.userId);
  });

  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };

  $scope.users = ()=> {
    console.log('this will get users to populate select');
  };

  $scope.addConversation = ()=> {
    UserFactory.getUser(loggedInUserId)
    .then((user)=> {
      return $q((resolve, reject)=> {
      let conversation = {
        users: [user.userId, $scope.selectedUser.userId],
        messages: [{text: $scope.message, authorName: user.name, authorImg: user.photo, authorId: user.userId, read: false, date: new Date(), index: 1}]
      };
      resolve(conversation);
      });
    })
    .then((conversation)=> {
      ConversationFactory.addConversation(conversation)
      .then(()=> {
        console.log('conversation added.');
      });
    });

    //closes the modal
    $uibModalInstance.close();

  };

});
