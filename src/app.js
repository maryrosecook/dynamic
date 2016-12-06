;(function(exports) {
  function start(window) {
    var buttons = setupButtons(document, Object.keys(plugins));
    var state = initState();
    var screen = setupScreen(window);
    var inputter = new Inputter(window);

    (function loopForever() {
      state = updateSelection(inputter, state);
      state = update(inputter, state);
      draw(state, screen);
      inputter.update();
      requestAnimationFrame(loopForever);
    })();
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

  function setupScreen(window) {
    var screen = window
        .document
        .getElementById("screen")
        .getContext("2d");
    screen.canvas.width = window.innerWidth;
    screen.canvas.height = window.innerHeight - 30;
    return screen;
  };

  function update(inputter, state) {
    function pipelineInputDataAndState(inputter, state, fns) {
      if (fns.length === 0) {
        return state;
      } else {
        return pipelineInputDataAndState(inputter,
                                         fns[0](inputter, state),
                                         fns.slice(1));
      }
    };

    return pipelineInputDataAndState(inputter, state, [
      updateSetCurrentGroup,
      updateAddData,
    ]);
  };

  function updateSelection(inputter, state) {
    return groupSelectors.reduce(function(state, groupSelector, i) {
      var groupSelector = groupSelectors[i];
      if (inputter.isPressed(inputter[i]) &&
          !_.contains(state.selectorFunctions, groupSelector)) {
        state.selectorFunctions.push(groupSelector);
      } else if (inputter.isUnpressed(inputter[i])) {
        state.selectorFunctions =
          _.without(state.selectorFunctions, groupSelector);
      }

      return state;
    }, state);

    return state;
  };

  function updateSetCurrentGroup(inputter, state) {
    state.currentGroup = inputter.isUnpressed(inputter.SHIFT) ?
      state.currentGroup + 1 :
      state.currentGroup;

    return state;
  };

  function updateAddData(inputter, state) {
    if (!inputter.isDown(inputter.SHIFT) ||
        !inputter.isDown(inputter.LEFT_MOUSE)) {
      return state;
    }

    var mousePosition = inputter.getMousePosition();
    return {
      currentGroup: state.currentGroup,
      selectorFunctions: state.selectorFunctions,
      data: state.data.concat(
        createDatum({
          x: mousePosition.x,
          y: mousePosition.y,
          type: "draw",
          time: Date.now(),
          group: state.currentGroup,
          color: "black"
        }))
    };
  };

  function createDatum(obj) {
    return _.extend(copyEvent(obj), { functions: [] });
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
