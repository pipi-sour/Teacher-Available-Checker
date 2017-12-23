// Polyfill for creating CustomEvents on IE11

// code pulled from:
// https://github.com/d4tocchini/customevent-polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill
// https://github.com/webcomponents/webcomponentsjs/blob/v0.7.12/CustomElements.js#L950

// This code is for test purposes only, use a polyfill, e.g. https://github.com/krambuhl/custom-event-polyfill

try {
  const testEvent = new window.CustomEvent('test');
  testEvent.preventDefault();
  if (testEvent.defaultPrevented !== true) {
    // IE has problems with .preventDefault() on custom events
    // http://stackoverflow.com/questions/23349191
    throw new Error('Could not prevent default, uses polyfill');
  }
}
catch (e) {
  console.info('Uses CustomEvent polyfill'); //eslint-disable-line no-console
  const CustomEvent = (inType, params = { bubbles: false, cancelable: false, detail: null }) => {
    const ce = document.createEvent('CustomEvent');
    ce.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
    ce.preventDefault = () => {
      Object.defineProperty(this, 'defaultPrevented', {
        get: () => {
          return true;
        }
      });
    };
    return ce;
  };
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent; // expose definition to window
}
