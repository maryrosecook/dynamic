;(function(exports) {
  exports.red = function(event) {
    return _.extend(copyEvent(event), { color: "red" } );
  };
})(this);
