;(function(exports) {
  exports.blue = function(event) {
    return _.extend(copyEvent(event), { color: "blue" } );
  };
})(this);
