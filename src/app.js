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
      state = updateSelection(inputData, state);
      state = update(inputData, state);
      draw(state, screen);
      requestAnimationFrame(loopForever);
    })();
  };

  var KEYS = {
    RECORD: "SHIFT"
  };

  var plugins = {
    blue: blue
  };

  var groupSelectors = _.range(0, 9)
      .map(function(groupNumber) {
        return groupSelector(groupNumber);
      });

  function draw(state, screen) {
    screen.clearRect(0,
                     0,
                     screen.canvas.width,
                     screen.canvas.height);
    state.data.forEach(_.partial(drawDatum, screen, state));
  };

  function isSelected(datum, selectorFunctions) {
    return selectorFunctions.length > 0 &&
      _.every(selectorFunctions, function(selectorFunction) {
        return selectorFunction(datum) === true;
      });
  };

  function drawDatum(screen, state, datum) {
    var reducedDatum = applyDatumFunctions(datum);
    var color = isSelected(datum, state.selectorFunctions) ?
        "red" :
        reducedDatum.color;

    screen.fillStyle = color;
    screen.fillRect(reducedDatum.x, reducedDatum.y, 3, 3);
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
      updateSetCurrentGroup,
      updateAddData,
    ]);
  };

  function updateSelection(inputData, state) {
    return groupSelectors.reduce(function(state, groupSelector, i) {
      var groupKey = i.toString();
      var groupSelector = groupSelectors[i];
      if (inputData.keysDown.current[groupKey] === true &&
          !_.contains(state.selectorFunctions, groupSelector)) {
        state.selectorFunctions.push(groupSelector);
      } else if (inputData.keysDown.previous[groupKey] === true &&
                 inputData.keysDown.current[groupKey] === false) {
        state.selectorFunctions =
          _.without(state.selectorFunctions, groupSelector);
      }

      return state;
    }, state);

    return state;
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

  function updateSetCurrentGroup(inputData, state) {
    var previousCurrentGroup = state.currentGroup;
    var aGoneUp = inputData.keysDown.previous[KEYS.RECORD] === true &&
        inputData.keysDown.current[KEYS.RECORD] === false;
    var currentGroup = aGoneUp ? previousCurrentGroup + 1 : previousCurrentGroup;
    state.currentGroup = currentGroup;

    return state;
  };

  function updateAddData(inputData, state) {
    if (!inputData.keysDown.current[KEYS.RECORD] ||
        !inputData.mouseDown ||
        inputData.mouseMoves.length === 0) {
      return state;
    }

    return {
      currentGroup: state.currentGroup,
      selectorFunctions: state.selectorFunctions,
      data: state.data.concat(
        inputData.mouseMoves
          .map(function(mouseEvent) {
            var position = input
                .extractPositionFromMouseEvent(mouseEvent);
            return createDatum({
              x: position.x,
              y: position.y,
              type: "draw",
              time: Date.now(),
              group: state.currentGroup,
              color: "black"
            });
          })
      )
    };
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
      currentGroup: 1,
      data: [],
      selectorFunctions: []
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
