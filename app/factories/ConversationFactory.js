'use strict';

app.factory('ConversationFactory', function($q, $http, FirebaseURL){

  let addConversation = (conversation)=> {
    return $q((resolve, reject)=> {
      $http.post(`${FirebaseURL}conversations.json`, angular.toJson(conversation))
      .success((response)=> {
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

  let getConversationsForUser = (httpCall)=> {
    return $q((resolve, reject)=> {
      $http.get(httpCall)
      .success((results)=> {
        resolve(results);
      });
    });
  };

  let getAllConversationsForUser = (userId)=> {
    let getConvos = [`${FirebaseURL}conversations.json?orderBy="user1"&equalTo="${userId}"`, `${FirebaseURL}conversations.json?orderBy="user2"&equalTo="${userId}"`];
    return $q.all(
      getConvos.map((call)=> {
        return getConversationsForUser(call);
      }))
      .then((results)=> {
        let conversations = [];
        return $q((resolve, reject)=> {
          results.forEach((result) => {
            for(var key in result){
              result[key].id = key;
              conversations.push(result[key]);
            }
          });
          resolve(conversations);
        });
      });
  };

  let addNewMessage = (user, convoId, message)=> {
    let formatedMessage = {
      authorId: user.userId,
      authorImg: user.photo,
      authorName: user.name,
      date: new Date(),
      read: false,
      text: message
    };
    return getConversationsForUser(`${FirebaseURL}conversations/${convoId}.json`)
      .then((conversation)=> {
        conversation.messages.push(formatedMessage);
        return $q((resolve, reject)=> {
          $http.patch(`${FirebaseURL}conversations/${convoId}.json`, angular.toJson(conversation))
          .success((response)=> {
            resolve();
          })
          .error((error)=> {
            console.error('Unable to add message to firebase: ', error);
          });
        });

      });
  };

  let updateRead = (convoId, indexArray)=> {
    return getConversationsForUser(`${FirebaseURL}conversations/${convoId}.json`)
      .then((conversation)=> {
        indexArray.forEach(i => conversation.messages[i].read = true);
        return $q.resolve(conversation);
      })
      .then((conversation)=> {
        return $q((resolve, reject)=> {
          $http.patch(`${FirebaseURL}conversations/${convoId}.json`, angular.toJson(conversation))
          .success((response)=> {
            resolve();
          })
          .error((error)=> {
            console.error('Unable to update read value on conversation: ', error);
          });
        });
      });
  };

  let deleteConversation = (convoId)=> {
    return $q((resolve, reject)=> {
      $http.delete(`${FirebaseURL}conversations/${convoId}.json`)
      .success(()=> {
        resolve();
      })
      .error((error)=> {
        console.error('unable to delete conversation: ', error);
      });
    });
  };

  return {addConversation, getAllConversations, getConversationsForUser, getAllConversationsForUser, deleteConversation, addNewMessage, updateRead};

});
