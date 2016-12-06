;(function(exports) {
  exports.copyEvent = function(event) {
    var eventCopy = {};
    for (var i in event) {
      if (typeof event[i] === "object") {
        throw new Error("Trying to shallow copy a deep object");
      }

      eventCopy[i] = event[i];
    }

    return eventCopy;
  };
})(this);
