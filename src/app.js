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

  var KEYS = {
    RECORD: "SHIFT",
    PLAY: "OPTION"
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

  function framesBeingDisplayed(frames, isPlaying, playStart) {
    if (isPlaying) {
      return frames.filter(function(event, __, data) {
        return Date.now() >
          transposeFrameToCurrentLoop(event.time,
                                      playStart,
                                      data[0].time,
                                      _.last(data).time);
      });
    } else {
      return frames;
    }
  };

  function drawRecording(screen, recording) {
    screen.fillStyle = recording.selected ? "red" : "black";

    framesBeingDisplayed(recording.data,
                         recording.playStart !== undefined,
                         recording.playStart)
      .forEach(function(event) {
        screen.fillRect(event.data.x, event.data.y, 20, 20);
      });
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

  function update(inputData, state) {
    function pipelineInputDataAndState(inputData, state, fns) {
      if (fns.length === 0) {
        return state;
      } else {
        return pipelineInputDataAndState(inputData,
                                         fns[0](inputData, state),
                                         fns.slice(1));
      }
    };

    return pipelineInputDataAndState(inputData, state, [
      currentRecording,
      addToRecordings,
      highlightRecordings,
      moveRecording,
      toggleRecordingsPlaying
    ]);
  };

  function latestInputData(events, previousInputData) {
    return {
      mouseDown: input.isMouseDown(previousInputData.mouseDown, events),
      keysDown: input.keysDown(previousInputData.keysDown, events),
      mousePosition: input.mousePosition(previousInputData.mousePosition, events),
      mouseMoves: input.mouseMoves(events)
    };
  };

  function toggleRecordingsPlaying(inputData, state) {
    if (!inputData.keysDown.previous[KEYS.PLAY] &&
        inputData.keysDown.current[KEYS.PLAY]) {
      state.recordings
        .filter(function (recording) { return recording.selected; })
        .forEach(function(recording) {
          recording.playStart = recording.playStart === undefined ? Date.now() : undefined;
        });
    }

    return state;
  };

  function moveRecording(inputData, state) {
    if (inputData.mouseDown) {
      var movement = {
        x: inputData.mousePosition.current.x - inputData.mousePosition.previous.x,
        y: inputData.mousePosition.current.y - inputData.mousePosition.previous.y
      };

      state.recordings
        .filter(function (recording) { return recording.selected; })
        .forEach(function(recording) {
          recording.data.forEach(function(event) {
            event.data.x += movement.x;
            event.data.y += movement.y;
          });
        });
    }

    return state;
  };

  function currentRecording(inputData, state) {
    var previousCurrentRecording = state.currentRecording;
    var aGoneUp = inputData.keysDown.previous[KEYS.RECORD] === true &&
        inputData.keysDown.current[KEYS.RECORD] === false;
    var currentRecording = aGoneUp ? previousCurrentRecording + 1 : previousCurrentRecording;
    state.currentRecording = currentRecording;
    return state;
  };

  function highlightRecordings(inputData, state) {
    state.recordings.forEach(function(recording, i) {
      recording.selected = inputData.keysDown.current[i.toString()] ? true : false;
    });

    return state;
  };

  function addToRecordings(inputData, state) {
    if (inputData.keysDown.current[KEYS.RECORD] && inputData.mouseDown) {
      if (state.recordings[state.currentRecording] === undefined) {
        state.recordings[state.currentRecording] = new Recording();
      }

      state.recordings[state.currentRecording].addData(
        inputData.mouseMoves
          .map(function(mouseEvent) {
            return new Event(input.extractPositionFromMouseEvent(mouseEvent),
                             "draw",
                             Date.now());
          })
      );
    }

    return state;
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
