  function framesBeingDisplayed(frames) {
    if (frames.length === 0) {
      return [];
    }

    var now = Date.now();
    return frames.filter(function(event, __, frames) {
      return now >
        timeline.transposeFrameTimeToCurrentLoop(
          now,
          event.time,
          frames[0].time,
          _.last(frames).time);
    });
  };
