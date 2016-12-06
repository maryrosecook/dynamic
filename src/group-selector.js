;(function(exports) {
  exports.groupSelector = function(groupNumber) {
    return function(event) {
      return event.group === groupNumber;
    };
  };
})(this);
