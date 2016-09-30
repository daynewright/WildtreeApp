'use strict';

app.controller('MessagesModalCtrl', function($scope, $uibModalInstance, $q, UserFactory, ConversationFactory, AuthFactory){

  let loggedInUserId = AuthFactory.getUserId();
  let conversations = [];
  let users = [];

  ConversationFactory.getAllConversations()
  .then((conversationsPromise)=> {
    conversations = conversationsPromise;
    return UserFactory.getAllUsers();
  })
  .then((usersPromise)=> {
    $scope.users = [];
    //remove loggedin user from users
    users = usersPromise.filter((user) => loggedInUserId !== user.userId);
    //if no conversations add all remaining users to scope
    if(conversations.length === 0){ return ($scope.users = users);}
    return $q.resolve();
  })
  .then(()=> {
    let addUser;
    console.log('conversations: ', conversations);
    console.log('users: ', users);

    users.forEach((user, i)=> {
      addUser = true;
      conversations.forEach((conversation)=> {
        if(user.userId === conversation.users[1]){ addUser = false; }
      });

      $scope.users.forEach((scopeUser)=> {
        if(scopeUser.userId !== user.userId){
           return addUser;
        }
        addUser = false;
      });
      if(addUser){ $scope.users.push(user); }
    });
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
