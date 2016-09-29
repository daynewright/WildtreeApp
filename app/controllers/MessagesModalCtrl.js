'use strict';

app.controller('MessagesModalCtrl', function($scope, $uibModalInstance){



  //close modal
  $scope.close = ()=> {
      $uibModalInstance.close();
  };

  $scope.users = ()=> {
    console.log('this will get users to populate select');
  };

  $scope.addConversation = ()=> {
    console.log('this will add a new conversation with a user');
    //closes the modal
    $uibModalInstance.close();

  };

});
