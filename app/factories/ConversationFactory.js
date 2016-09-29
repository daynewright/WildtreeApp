'use strict';

app.factory('ConversationFactory', function($q, $http, FirebaseURL){

  let addConversation = (conversation)=> {
    return $q((resolve, reject)=> {
      $http.post(`${FirebaseURL}conversations.json`, angular.toJson(conversation))
      .success((response)=> {
        console.log('Conversation added to firebase!');
        resolve();
      })
      .error((error)=> {
        console.error('Unable to add conversation to firebase: ', error);
      });
    });
  };

  return {addConversation};

});
