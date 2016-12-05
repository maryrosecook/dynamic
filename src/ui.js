;(function(global) {
  function setup(document) {
    var buttonContainer = createButtonContainer();
    dom.appendChild(document.body, buttonContainer);

    dom.appendChild(buttonContainer,
                    dom.addEventListener(createButton("green"),
                                         "click", function() {
                                           console.log("green!")
                                         }));
  };

  function createButton(text) {
    return dom.setInnerHtml(dom.createElement(document, "button"),
                            text);
  };

  function createButtonContainer() {
    var buttonContainerId = "buttons";
    return dom.setId(dom.createElement(document, "div"),
                     buttonContainerId);
  };

  global.ui = {
    setup: setup
  };
})(this);
