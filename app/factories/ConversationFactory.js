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

  let getAllConversations = ()=> {
    return $q((resolve, reject)=> {
      $http.get(`${FirebaseURL}conversations.json`)
      .success((results)=> {
        let formatedConversations = [];
        for(var key in results){
          results[key].id = key;
          formatedConversations.push(results[key]);
        }
        resolve(formatedConversations);
      });
    });
  };

  return {addConversation, getAllConversations};

});
