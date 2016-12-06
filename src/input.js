;(function(exports) {
  var Inputter = function(window) {
    this._buttonListener = new ButtonListener(window);
    this._mouseMoveListener = new MouseMoveListener(window);
  };

  Inputter.prototype = {
    update: function() {
      this._buttonListener.update();
    },

    // Returns true if passed button currently down
    isDown: function(button) {
      return this._buttonListener.isDown(button);
    },

    // Returns true if passed button just gone down. true once per keypress.
    isPressed: function(button) {
      return this._buttonListener.isPressed(button);
    },

    isUnpressed: function(button) {
      return this._buttonListener.isUnpressed(button);
    },

    getMousePosition: function() {
      return this._mouseMoveListener.getMousePosition();
    },

    // Returns true if passed button currently down
    bindMouseMove: function(fn) {
      return this._mouseMoveListener.bind(fn);
    },

    // Stops calling passed fn on mouse move
    unbindMouseMove: function(fn) {
      return this._mouseMoveListener.unbind(fn);
    },

    LEFT_MOUSE: "LEFT_MOUSE",
    RIGHT_MOUSE: "RIGHT_MOUSE",

    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAUSE: 19,
    CAPS_LOCK: 20,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    INSERT: 45,
    DELETE: 46,
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    NUM_LOCK: 144,
    SCROLL_LOCK: 145,
    SEMI_COLON: 186,
    EQUALS: 187,
    COMMA: 188,
    DASH: 189,
    PERIOD: 190,
    FORWARD_SLASH: 191,
    GRAVE_ACCENT: 192,
    OPEN_SQUARE_BRACKET: 219,
    BACK_SLASH: 220,
    CLOSE_SQUARE_BRACKET: 221,
    SINGLE_QUOTE: 222
  };

  var ButtonListener = function(window) {
    var self = this;
    this._buttonDownState = {};
    this._buttonPressedState = {};
    this._buttonUnpressedState = {};

    window.addEventListener('keydown', function(e) {
      self._down(e.keyCode);
    }, false);

    window.addEventListener('keyup', function(e) {
      self._up(e.keyCode);
    }, false);

    window.addEventListener('mousedown', function(e) {
      self._down(self._getMouseButton(e));
    }, false);

    window.addEventListener('mouseup', function(e) {
      self._up(self._getMouseButton(e));
    }, false);
  };

  ButtonListener.prototype = {
    update: function() {
      for (var i in this._buttonPressedState) {
        if (this._buttonPressedState[i] === true) { // tick passed and press event in progress
          this._buttonPressedState[i] = false; // end key press
        }
      }

      for (var i in this._buttonUnpressedState) {
        if (this._buttonUnpressedState[i] === true) { // tick passed and unpress event in progress
          this._buttonUnpressedState[i] = false; // end unpress
        }
      }
    },

    _down: function(buttonId) {
      this._buttonDownState[buttonId] = true;
      if (this._buttonPressedState[buttonId] === undefined) { // start of new keypress
        this._buttonPressedState[buttonId] = true; // register keypress in progress
      }

      if (this._buttonUnpressedState[buttonId] === false) { // prev key unpress registered by update loop
        this._buttonUnpressedState[buttonId] = undefined; // prep for keyup to start next unpress
      }
    },

    _up: function(buttonId) {
      this._buttonDownState[buttonId] = false;
      if (this._buttonPressedState[buttonId] === false) { // prev keypress over
        this._buttonPressedState[buttonId] = undefined; // prep for keydown to start next press
      }

      if (this._buttonUnpressedState[buttonId] === undefined) { // start of new keyunpress
        this._buttonUnpressedState[buttonId] = true; // register key unpress in progress
      }
    },

    isDown: function(button) {
      return this._buttonDownState[button] || false;
    },

    isPressed: function(button) {
      return this._buttonPressedState[button] || false;
    },

    isUnpressed: function(button) {
      return this._buttonUnpressedState[button] || false;
    },

    _getMouseButton: function(e) {
      if (e.which !== undefined || e.button !== undefined) {
        if (e.which === 3 || e.button === 2) {
          return Inputter.prototype.RIGHT_MOUSE;
        } else if (e.which === 1 || e.button === 0 || e.button === 1) {
          return Inputter.prototype.LEFT_MOUSE;
        }
      }

      throw "Cannot judge button pressed on passed mouse button event";
    }
  };

  var MouseMoveListener = function(window) {
    this._bindings = [];
    this._mousePosition;
    var self = this;

    window.addEventListener('mousemove', function(e) {
      var absoluteMousePosition = self._getAbsoluteMousePosition(e);
      self._mousePosition = {
        x: absoluteMousePosition.x,
        y: absoluteMousePosition.y
      };
    }, false);

    window.addEventListener('mousemove', function(e) {
      for (var i = 0; i < self._bindings.length; i++) {
        self._bindings[i](self.getMousePosition());
      }
    }, false);
  };

  MouseMoveListener.prototype = {
    bind: function(fn) {
      this._bindings.push(fn);
    },

    unbind: function(fn) {
      for (var i = 0; i < this._bindings.length; i++) {
        if (this._bindings[i] === fn) {
          this._bindings.splice(i, 1);
          return;
        }
      }

      throw "Function to unbind from mouse moves was never bound";
    },

    getMousePosition: function() {
      return this._mousePosition;
    },

    _getAbsoluteMousePosition: function(e) {
	    if (e.pageX) 	{
        return { x: e.pageX, y: e.pageY };
	    } else if (e.clientX) {
        return { x: e.clientX, y: e.clientY };
      }
    }
  };

  exports.Inputter = Inputter;
})(this);
