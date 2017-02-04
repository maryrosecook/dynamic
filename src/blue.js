;(function(exports) {
  exports.color = function(color) {
    return function(event) {
      return event.merge({ color: color });
    };
  };
})(this);
