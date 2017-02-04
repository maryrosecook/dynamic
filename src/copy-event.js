;(function(exports) {
  exports.copyEvent = function(event) {
    var eventCopy = {};
    for (var i in event) {
      if (typeof event[i] === "object") {
        console.log(event[i])
        throw new Error(`Trying to shallow copy deep object`);
      }

      eventCopy[i] = event[i];
    }

    return eventCopy;
  };
})(this);
