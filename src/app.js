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

    state.groups.forEach(function(group, i) {
      screen.fillStyle = group.selected ? "red" : "black";

      group.forEach(function(position) {
        screen.fillRect(position.x, position.y, 20, 20);
      });
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
    updateGroups(events, state);
  };

  function updateInput(events, state) {
    state.input = {
      mouseDown: input.isMouseDown(state.input.mouseDown, events),
      keysDown: input.keysDown(state.input.keysDown, events),
      mousePosition: input.mousePosition(state.input.mousePosition, events)
    }
  };

  function updateGroups(events, state) {
    state.currentGroup = currentGroup(state, state.currentGroup, events);
    state.groups = addToGroups(state, state.groups, events);
    state.groups = highlightGroups(state, state.groups, events);
    state.groups = moveGroup(state, state.groups);
  };

  function moveGroup(state, groups) {
    if (state.input.mouseDown) {
      var movement = {
        x: state.input.mousePosition.current.x - state.input.mousePosition.previous.x,
        y: state.input.mousePosition.current.y - state.input.mousePosition.previous.y
      };

      groups
        .filter(function (group) { return group.selected; })
        .forEach(function(group) {
          group.forEach(function(event) {
            event.x += movement.x;
            event.y += movement.y;
          });
        });
    }

    return groups;
  };

  function currentGroup(state, previousCurrentGroup, events) {
    var aGoneUp = state.input.keysDown.previous.a === true &&
        state.input.keysDown.current.a === false;
    return aGoneUp ? previousCurrentGroup + 1 : previousCurrentGroup;
  };

  function highlightGroups(state, groups, events) {
    groups.forEach(function(group, i) {
      group.selected = state.input.keysDown.current[i.toString()] ? true : false;
    });

    return groups;
  };

  function addToGroups(state, groups, events) {
    if (state.input.keysDown.current.a && state.input.mouseDown) {
      if (groups[state.currentGroup] === undefined) {
        groups[state.currentGroup] = [];
      }

      groups[state.currentGroup] = groups[state.currentGroup].concat(
        events
          .filter(isEventType("mousemove"))
          .map(input.extractPositionFromMouseEvent)
      );

      return groups;
    } else {
      return groups;
    }
  };

  function initState() {
    return {
      input: {
        keysDown: { previous: {}, current: {} },
        mouseDown: false,
        mousePosition: { previous: undefined, current: undefined }
      },
      currentGroup: 1,
      groups: []
    };
  };

  exports.app = {
    start: start
  };
})(this);
