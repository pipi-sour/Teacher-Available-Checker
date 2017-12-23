'use strict';

import {assert} from 'chai';
import sinon from 'sinon';

export function spyOnKeyboardEvent(target, keyCode, shiftKey=false) {
  const spy = sinon.spy();
  target.addEventListener('keydown', spy);

  try {
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      keyCode: keyCode,
      shiftKey: shiftKey
    });
    target.dispatchEvent(event);
  }
  finally {
    target.removeEventListener('keydown', spy);
  }
  assert.isTrue(spy.calledOnce, `Expected "keydown" event to fire once for key ${keyCode}`);
}
