'use strict';

app.controller('MessagesModalCtrl', function($scope, $uibModalInstance, $q, UserFactory, ConversationFactory, AuthFactory){
  $scope.showSpinner = true;

  let loggedInUserId = AuthFactory.getUserId();
  let conversations = [];
  let users = [];

  ConversationFactory.getAllConversationsForUser(loggedInUserId)
  .then((conversationsPromise)=> {
    console.log('the result from getConversationsForUser: ', conversationsPromise);
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
