;(function(exports) {
  function start(window) {
    var events = gatherEvents(window);
    var inputData = initInputData();
    var state = initState();
    var screen = getScreen(window);

    (function loopForever() {
      inputData = latestInputData(events, inputData);
      clearArray(events);
      update(inputData, state);
      draw(state, screen);
      requestAnimationFrame(loopForever);
    })();
  };

  function draw(state, screen) {
    screen.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
    state.recordings.forEach(_.partial(drawRecording, screen));
  };

  function transposeFrameToCurrentLoop(frameTime, playTime, firstFrameTime, lastFrameTime) {
    var animationDuration = lastFrameTime - firstFrameTime;
    var now = Date.now();
    return now - ((now - playTime) % animationDuration) +
      frameTime - firstFrameTime;
  };

  function framesBeingDisplayed(frames, playStart) {
    return frames.filter(function(event, __, data) {
      return Date.now() >
        transposeFrameToCurrentLoop(event.time,
                                    playStart,
                                    data[0].time,
                                    _.last(data).time);
    });
  };

  function drawRecording(screen, recording) {
    screen.fillStyle = recording.selected ? "red" : "black";

    if (recording.playStart !== undefined) {
      framesBeingDisplayed(recording.data, recording.playStart)
        .forEach(function(event) {
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

  function clearArray(array) {
    array.splice(0, array.length);
  };

  function update(input, state) {
    updateRecordings(input, state);
  };

  function latestInputData(events, previousInputData) {
    return {
      mouseDown: input.isMouseDown(previousInputData.mouseDown, events),
      keysDown: input.keysDown(previousInputData.keysDown, events),
      mousePosition: input.mousePosition(previousInputData.mousePosition, events),
      mouseMoves: input.mouseMoves(events)
    };
  };

  function updateRecordings(inputData, state) {
    state.currentRecording = currentRecording(inputData, state.currentRecording);
    state.recordings = addToRecordings(inputData, state, state.recordings);
    state.recordings = highlightRecordings(inputData, state.recordings);
    state.recordings = moveRecording(inputData, state.recordings);
    state.recordings = toggleRecordingsPlaying(inputData, state.recordings);
  };

  function toggleRecordingsPlaying(inputData, recordings) {
    if (!inputData.keysDown.previous.o &&
        inputData.keysDown.current.o) {
      recordings
        .filter(function (recording) { return recording.selected; })
        .forEach(function(recording) {
          recording.playStart = recording.playStart === undefined ? Date.now() : undefined;
        });
    }

    return recordings;
  };

  function moveRecording(inputData, recordings) {
    if (inputData.mouseDown) {
      var movement = {
        x: inputData.mousePosition.current.x - inputData.mousePosition.previous.x,
        y: inputData.mousePosition.current.y - inputData.mousePosition.previous.y
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

  function currentRecording(inputData, previousCurrentRecording) {
    var aGoneUp = inputData.keysDown.previous.a === true &&
        inputData.keysDown.current.a === false;
    return aGoneUp ? previousCurrentRecording + 1 : previousCurrentRecording;
  };

  function highlightRecordings(inputData, recordings) {
    recordings.forEach(function(recording, i) {
      recording.selected = inputData.keysDown.current[i.toString()] ? true : false;
    });

    return recordings;
  };

  function addToRecordings(inputData, state, recordings) {
    if (inputData.keysDown.current.a && inputData.mouseDown) {
      if (recordings[state.currentRecording] === undefined) {
        recordings[state.currentRecording] = new Recording();
      }

      recordings[state.currentRecording].addData(
        inputData.mouseMoves
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

  function initInputData() {
    return {
      keysDown: { previous: {}, current: {} },
      mouseDown: false,
      mousePosition: { previous: undefined, current: undefined },
      mouseMoves: []
     };
  };

  function initState() {
    return {
      input: initInputData(),
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
