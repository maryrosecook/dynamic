;(function(exports) {
  function isMouseDown(previous, events) {
    var mouseEvent = latestMouseUpDownEvent(events);
    if (mouseEvent) {
      return mouseEvent.type === "mousedown";
    } else {
      return previous;
    }
  };

  function latestMouseUpDownEvent(events) {
    return _.last(events.filter(function(mouseEvent) {
      return mouseEvent.type === "mousedown" || mouseEvent.type === "mouseup";
    }));
  };

  function keysDown(previous, events) {
    var eventIsDown = {
      keydown: true,
      keyup: false
    };

    var keyEvents = _.groupBy(events
                              .filter(function(event) {
                                return event.type === "keydown" || event.type === "keyup";
                              }), function(event) {
                                return event.key;
                              });

    var newKeyValues = _.mapObject(keyEvents, function(value, key) {
      return eventIsDown[_.last(value).type];
    });

    return {
      previous: previous.current === undefined ?
        undefined :
        JSON.parse(JSON.stringify(previous.current)),
      current: _.extend(previous.current, newKeyValues)
    };
  };

  function isEventType(type) {
    return function(mouseEvent) {
      return mouseEvent.type === type;
    };
  };

  function mouseMoves(events) {
    return events.filter(isEventType("mousemove"));
  };

  function mousePosition(previous, events) {
    var lastMouseEvent = _.last(events.filter(function(event) {
      return event.type === "mousemove" ||
        event.type === "mousedown" ||
        event.type === "mouseup";
    }));

    return {
      previous: previous.current,
      current: lastMouseEvent ?
        extractPositionFromMouseEvent(lastMouseEvent) :
        previous.current
    };
  };

  function extractPositionFromMouseEvent(mouseEvent) {
    return { x: mouseEvent.pageX, y: mouseEvent.pageY };
  };

  exports.input = {
    isMouseDown: isMouseDown,
    keysDown: keysDown,
    mousePosition: mousePosition,
    extractPositionFromMouseEvent: extractPositionFromMouseEvent,
    mouseMoves: mouseMoves
  };
})(this);
