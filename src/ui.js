;(function(global) {
  function createPanel(document, body) {
    return dom.appendChild(
      body,
      dom.createElement(document, "div"));
  };

  function addButton(panel, text) {
    return dom.appendChild(
      panel,
      dom.setInnerHtml(dom.createElement(document, "button"),
                       text));
  };

  global.ui = {
    createPanel: createPanel,
    addButton: addButton
  };
})(this);
