;(function(global) {
  function createElement(document, elementType) {
    return document.createElement(elementType);
  };

  function setInnerHtml(element, innerHtml) {
    element.innerHTML = innerHtml;
    return element;
  };

  function addEventListener(element, eventName, handler) {
    element.addEventListener(eventName, handler);
    return element;
  };

  function setId(element, id) {
    element.id = id;
    return element;
  };

  function appendChild(element, child) {
    element.appendChild(child);
    return child;
  };

  global.dom = {
    createElement: createElement,
    setInnerHtml: setInnerHtml,
    addEventListener: addEventListener,
    appendChild: appendChild,
    setId: setId
  };
})(this);
