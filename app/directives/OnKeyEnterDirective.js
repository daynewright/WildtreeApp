'use strict';

app.directive('onKeyEnter', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        element.bind('keydown keypress', function(event) {
            if (event.which === 13) {
                var attrValue = $parse(attrs.onKeyEnter);
                if(typeof attrValue === 'function'){
                   attrValue(scope);
                 } else {
                   angular.noop();
                 }
                event.preventDefault();
            }
        });
        scope.$on('$destroy', function() {
            element.unbind('keydown keypress');
        });
    }
  };
});
