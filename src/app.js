;(function(exports) {
  var im = Immutable;

  function start(window) {
    var state = initState();
    var screen = setupScreen(window);
    var inputter = setupInputter(window);

    var tick = 0;
    (function loopForever() {
      if (tick++ % 5 === 0) {
        state = updateSelection(inputter, state);
        state = update(inputter, state);
        draw(state, screen);
        inputter.update();
      }

      requestAnimationFrame(loopForever);
    })();
  };

  var plugins = {
    red: color("red"),
    blue: color("blue"),
    green: color("green"),
    yellow: color("yellow")
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
    state.get("data").forEach(_.partial(drawDatum, screen, state));
  };

  function isSelected(datum, selectorFunctions) {
    return selectorFunctions.count() > 0 &&
      _.every(selectorFunctions.toJS(), function(selectorFunction) {
        return selectorFunction(datum) === true;
      });
  };

  function drawDatum(screen, state, datum) {
    var reducedDatum = applyDatumFunctions(datum);
    var color = isSelected(datum, state.get("selectorFunctions")) ?
        "red" :
        reducedDatum.get("color");
    screen.fillStyle = color;
    screen.fillRect(reducedDatum.get("x"),
                    reducedDatum.get("y"),
                    3,
                    3);
  };

  function applyDatumFunctions(datum) {
    return datum.get("functions")
      .reduce(function(latestDatum, fn) {
        return fn(latestDatum);
      }, datum);
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
      updateForButtonClicks
    ]);
  };

  function updateForButtonClicks(inputter, state) {
    return Object.keys(inputter.buttons)
      .reduce((state, buttonName) => {
        if (inputter.isButtonClicked(buttonName)) {
          var data = state.get("data").map((datum) => {
            if (isSelected(datum,
                           state.get("selectorFunctions"))) {
              return datum.set("functions",
                               datum
                                 .get("functions")
                                 .push(plugins[buttonName]));
            } else {
              return datum;
            }
          });

          return state.set("data", data);
        } else {
          return state;
        }
      }, state);
  };

  function updateSelection(inputter, state) {
    return groupSelectors
      .reduce(function(state, groupSelector, i) {
        var groupSelector = groupSelectors[i];
        if (inputter.isPressed(inputter[i]) &&
            !_.contains(state.get("selectorFunctions"),
                        groupSelector)) {
          return state
            .set("selectorFunctions",
                 state.get("selectorFunctions")
                 .push(groupSelector));
        } else if (inputter.isUnpressed(inputter[i])) {
          return state.set("selectorFunctions",
                           state.get("selectorFunctions")
                           .filter(function(fn) {
                             return fn !== groupSelector;
                           }));
        }

        return state;
      }, state);
  };

  function updateSetCurrentGroup(inputter, state) {
    return state.set("currentGroup",
                     inputter.isUnpressed(inputter.SHIFT) ?
                       state.get("currentGroup") + 1 :
                       state.get("currentGroup"));
  };

  function updateAddData(inputter, state) {
    if (!inputter.isDown(inputter.SHIFT) ||
        !inputter.isDown(inputter.LEFT_MOUSE)) {
      return state;
    }

    var mousePosition = inputter.getMousePosition();
    return state.set("data",
                     state.get("data").push(
                       createDatum({
                         x: mousePosition.x,
                         y: mousePosition.y,
                         type: "draw",
                         time: Date.now(),
                         group: state.get("currentGroup"),
                         color: "black"
                       })));
  };

  function createDatum(obj) {
    return im.Map(obj).set("functions", im.List());
  };

  function initState() {
    return im.Map({
      currentGroup: 1,
      data: im.List(),
      selectorFunctions: im.List()
    });
  };

  function setupInputter(window) {
    var pluginNames = Object.keys(plugins);
    var buttons = setupButtons(document, pluginNames);
    return new Inputter(
      window,
      _.object(pluginNames, buttons));
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
