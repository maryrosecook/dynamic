;(function(exports) {
  function start(window) {
    var buttons = setupButtons(document, Object.keys(plugins));
    var events = gatherEvents(window, buttons);
    var inputData = initInputData();
    var state = initState();
    var screen = setupScreen(window);

    (function loopForever() {
      inputData = latestInputData(events, inputData);
      clearArray(events);
      state = update(inputData, state);
      draw(state, screen);
      requestAnimationFrame(loopForever);
    })();
  };

  var KEYS = {
    RECORD: "SHIFT"
  };

  var plugins = {
    red: red
  };

  function draw(state, screen) {
    screen.clearRect(0,
                     0,
                     screen.canvas.width,
                     screen.canvas.height);
    state.data.forEach(_.partial(drawDatum, screen));
  };

  function drawDatum(screen, datum) {
    var reducedDatum = applyDatumFunctions(datum);
    screen.fillStyle = reducedDatum.color;
    screen.fillRect(reducedDatum.x, reducedDatum.y, 2, 2);
  };

  function applyDatumFunctions(datum) {
    return datum
      .functions
      .reduce(function(latestDatum, fn) { return fn(latestDatum); }, datum);
  };

  function gatherEvents(window, uiButtons) {
    var events = [];
    collectEvents("mousemove", events, window);
    collectEvents("mousedown", events, window);
    collectEvents("mouseup", events, window);
    collectEvents("keydown", events, window);
    collectEvents("keyup", events, window);
    uiButtons.forEach(_.partial(collectEvents, "click", events));
    return events;
  };

  function collectEvents(eventName, events, element) {
    element.addEventListener(eventName, function(event) {
      events.push(event);
    });
  };

  function setupScreen(window) {
    var screen = window
        .document
        .getElementById("screen")
        .getContext("2d");
    screen.canvas.width = window.innerWidth;
    screen.canvas.height = window.innerHeight - 30;
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
      // updateSetCurrentPiece,
      updateAddData
      // updateHighlightPieces,
      // updateMovePiece
    ]);
  };

  function latestInputData(events, previousInputData) {
    return {
      mouseDown: input.isMouseDown(
        previousInputData.mouseDown, events),
      keysDown: input.keysDown(previousInputData.keysDown, events),
      mousePosition: input.mousePosition(
        previousInputData.mousePosition, events),
      mouseMoves: input.mouseMoves(events),
      uiButtonClicks: events.filter(function(event) {
        return event.type === "click";
      })
    };
  };

  function updateSetCurrentPiece(inputData, state) {
    var previousCurrentPiece = state.currentPiece;
    var aGoneUp = inputData.keysDown.previous[KEYS.RECORD] === true &&
        inputData.keysDown.current[KEYS.RECORD] === false;
    var currentPiece = aGoneUp ? previousCurrentPiece + 1 : previousCurrentPiece;
    state.currentPiece = currentPiece;

    return state;
  };

  function updateAddData(inputData, state) {
    if (!inputData.keysDown.current[KEYS.RECORD] ||
        !inputData.mouseDown ||
        inputData.mouseMoves.length === 0) {
      return state;
    }

    var a =  {
      currentPiece: state.currentPiece,
      data: state.data.concat(
        inputData.mouseMoves
          .map(function(mouseEvent) {
            var position = input
                .extractPositionFromMouseEvent(mouseEvent);
            return createDatum({
              x: position.x,
              y: position.y,
              type: "draw",
              time: Date.now()
            });
          })
      )
    };

    return a
  };

  function createDatum(obj) {
    return _.extend(copyEvent(obj), { functions: [] });
  };

  function initInputData() {
    return {
      keysDown: { previous: {}, current: {} },
      mouseDown: false,
      mousePosition: { previous: undefined, current: undefined },
      mouseMoves: [],
      uiButtonClicks: []
    };
  };

  function initState() {
    return {
      currentPiece: 1,
      data: []
    };
  };

  function createPiece(data) {
    return {
      data: data,
      functions: []
    }
  };

  function addDataToPiece(piece, data) {
    return {
      data: piece.data.concat(data),
      functions: piece.functions
    };
  };

  function setupButtons(document, pluginNames) {
    var panel = ui.createPanel(document, document.body);
    return pluginNames.map(_.partial(ui.addButton,
                                     panel));
  };

  exports.app = {
    start: start
  };
})(this);


  // function updateHighlightPieces(inputData, state) {
  //   state.pieces.forEach(function(piece, i) {
  //     piece.selected = inputData.keysDown.current[i.toString()] ? true : false;
  //   });

  //   return state;
  // };

  // function updateMovePiece(inputData, state) {
  //   if (inputData.mouseDown) {
  //     var movement = {
  //       x: inputData.mousePosition.current.x - inputData.mousePosition.previous.x,
  //       y: inputData.mousePosition.current.y - inputData.mousePosition.previous.y
  //     };

  //     state.pieces
  //       .filter(function (piece) { return piece.selected; })
  //       .forEach(function(piece) {
  //         data.forEach(function(event) {
  //           event.x += movement.x;
  //           event.y += movement.y;
  //         });
  //       });
  //   }

  //   return state;
  // };
