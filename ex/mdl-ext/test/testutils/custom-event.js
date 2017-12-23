/**
 * @license
 * Copyright 2016 Leif Olsen. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * Note: The CustomEvent bug is fixed in mdl-1.2.0
 *
 * Due to a bug in mdl-1.1.3 it is not possible to use a globally polyfilled CustomEvent constructor
 * Since I do not care too much about IE11, a brute force approach is sufficient.
 *
 * @param {string} typeArg Is a String representing the name of the event.
 * @param {Object} customEventInit Is an EventInit dictionary, having the following fields:
 *        "bubbles", optional and defaulting to false, of type Boolean, indicating if the event bubbles or not.
 *        "cancelable", optional and defaulting to false, of type Boolean, indicating if the event can be canceled or not.
 *        "detail", optional and defaulting to null, of type any, that is an event-dependent value associated with the event.
 */

export function createCustomEvent( typeArg, customEventInit = { bubbles: false, cancelable: false, detail: null } ) {

  try {
    // Modern browsers
    return new window.CustomEvent(typeArg, customEventInit);
  }
  catch (e) {
    // Copied from https://github.com/webcomponents/webcomponentsjs/blob/v0.7.12/CustomElements.js#L950
    // Copied from http://stackoverflow.com/questions/23349191/event-preventdefault-is-not-working-in-ie-11-for-custom-events
    const ce = document.createEvent('CustomEvent');
    ce.initCustomEvent(typeArg, customEventInit.bubbles, customEventInit.cancelable, customEventInit.detail);

    ce.preventDefault = () => {
      Object.defineProperty(this, 'defaultPrevented', {
        get: () => {
          return true;
        }
      });
    };
    return ce;
  }
  // Let old browsers throw whatewer they want to throw
}
