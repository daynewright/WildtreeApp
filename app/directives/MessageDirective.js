'use strict';

app.directive('messages', function(){
  return {
    restrict: 'E',
    templateUrl: '..partials/directives/messages.html',
    replace: true,
    scope: {
    }
  };
});
