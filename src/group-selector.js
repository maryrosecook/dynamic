;(function(exports) {
  exports.groupSelector = function(groupNumber) {
    return function(datum) {
      return datum.get("group") === groupNumber;
    };
  };
})(this);
