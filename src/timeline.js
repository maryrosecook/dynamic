;(function(exports) {
  function transposeFrameTimeToCurrentLoop(now,
                                           frameTime,
                                           firstFrameTime,
                                           lastFrameTime) {
    var animationDuration = lastFrameTime + 1 - firstFrameTime;
    return now -
      ((now - firstFrameTime) % animationDuration) +
      frameTime - firstFrameTime;
  };

  exports.transposeFrameTimeToCurrentLoop =
    transposeFrameTimeToCurrentLoop
})(typeof exports === "undefined" ? this.timeline = {} : exports);
