;(function(exports) {
  function start(window) {
    var events = gatherEvents(window);
    var state = initState();
    var screen = getScreen(window);

    (function loopForever() {
      tick(events, state);
      draw(state, screen);
      requestAnimationFrame(loopForever);
    })();
  };

  function tick(events, state) {
    update(events.concat(), state);
    clearArray(events);
  };

  function draw(state, screen) {
    screen.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
    state.recordings.forEach(_.partial(drawRecording, screen));
  };

  function drawRecording(screen, recording) {
    screen.fillStyle = recording.selected ? "red" : "black";

    if (recording.playStart !== undefined) {
      var slowdown = 20;
      var eventIndex = Math.floor(((Date.now() - recording.playStart) % (recording.data.length * slowdown)) / slowdown);

      recording.data.slice(0, eventIndex).forEach(function(event) {
        screen.fillRect(event.data.x, event.data.y, 20, 20);
      });
    } else {
      recording.data.forEach(function(event) {
        screen.fillRect(event.data.x, event.data.y, 20, 20);
      });
    }
  };

  function gatherEvents(window) {
    var events = [];
    collectEvents(window, "mousemove", events);
    collectEvents(window, "mousedown", events);
    collectEvents(window, "mouseup", events);
    collectEvents(window, "keydown", events);
    collectEvents(window, "keyup", events);
    return events;
  };

  function collectEvents(window, eventName, events) {
    window.addEventListener(eventName, function(event) {
      events.push(event);
    });
  };

  function getScreen(window) {
    var screen = window.document.getElementById("screen").getContext("2d");
    screen.canvas.width = window.innerWidth;
    screen.canvas.height = window.innerHeight;
    return screen;
  };

  function isEventType(type) {
    return function(mouseEvent) {
      return mouseEvent.type === type;
    };
  };

  function clearArray(array) {
    array.splice(0, array.length);
  };

  function update(events, state) {
    updateInput(events, state);
    updateRecordings(events, state);
  };

  function updateInput(events, state) {
    state.input = {
      mouseDown: input.isMouseDown(state.input.mouseDown, events),
      keysDown: input.keysDown(state.input.keysDown, events),
      mousePosition: input.mousePosition(state.input.mousePosition, events)
    }
  };

  function updateRecordings(events, state) {
    state.currentRecording = currentRecording(state, state.currentRecording, events);
    state.recordings = addToRecordings(state, state.recordings, events);
    state.recordings = highlightRecordings(state, state.recordings, events);
    state.recordings = moveRecording(state, state.recordings);
    state.recordings = toggleRecordingsPlaying(state, state.recordings);
  };

  function toggleRecordingsPlaying(state, recordings) {
    if (!state.input.keysDown.previous.o &&
        state.input.keysDown.current.o) {
      recordings
        .filter(function (recording) { return recording.selected; })
        .forEach(function(recording) {
          recording.playStart = recording.playStart === undefined ? Date.now() : undefined;
        });
    }

    return recordings;
  };

  function moveRecording(state, recordings) {
    if (state.input.mouseDown) {
      var movement = {
        x: state.input.mousePosition.current.x - state.input.mousePosition.previous.x,
        y: state.input.mousePosition.current.y - state.input.mousePosition.previous.y
      };

      recordings
        .filter(function (recording) { return recording.selected; })
        .forEach(function(recording) {
          recording.data.forEach(function(event) {
            event.data.x += movement.x;
            event.data.y += movement.y;
          });
        });
    }

    return recordings;
  };

  function currentRecording(state, previousCurrentRecording, events) {
    var aGoneUp = state.input.keysDown.previous.a === true &&
        state.input.keysDown.current.a === false;
    return aGoneUp ? previousCurrentRecording + 1 : previousCurrentRecording;
  };

  function highlightRecordings(state, recordings, events) {
    recordings.forEach(function(recording, i) {
      recording.selected = state.input.keysDown.current[i.toString()] ? true : false;
    });

    return recordings;
  };

  function addToRecordings(state, recordings, events) {
    if (state.input.keysDown.current.a && state.input.mouseDown) {
      if (recordings[state.currentRecording] === undefined) {
        recordings[state.currentRecording] = new Recording();
      }

      recordings[state.currentRecording].addData(
        events
          .filter(isEventType("mousemove"))
          .map(function(mouseEvent) {
            return new Event(input.extractPositionFromMouseEvent(mouseEvent),
                             "draw",
                             Date.now());
          })
      );

      return recordings;
    } else {
      return recordings;
    }
  };

  function initState() {
    return {
      input: {
        keysDown: { previous: {}, current: {} },
        mouseDown: false,
        mousePosition: { previous: undefined, current: undefined }
      },
      currentRecording: 1,
      recordings: []
    };
  };

  function Event(data, type, time) {
    this.data = data;
    this.type = type;
    this.time = time;
  };

  function Recording() {
    this.data = [];
  };

  Recording.prototype = {
    addData: function(extraData) {
      this.data = this.data.concat(extraData);
    }
  };

  exports.app = {
    start: start
  };
})(this);
