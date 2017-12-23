'use strict';
import jsdomify from 'jsdomify';
import { assert } from 'chai';
import sinon from 'sinon';

import { createCustomEvent } from './custom-event';

describe('createCustomEvent', () => {

  before ( () => {
    jsdomify.create('<!doctype html><html><body><div id="mount"></div></body></html>');
  });

  after ( () => {
    jsdomify.destroy();
  });

  it('should be defined', () => {
    assert.isDefined(createCustomEvent);
  });

  it('should be defined as a function', () => {
    assert.doesNotThrow( () => {
      createCustomEvent('cat');
    }, Error);
  });

  it('should work when window.CustomEvent is undefined, IE11', () => {
    const x = window.CustomEvent; // Emulate IE11
    try {
      window.CustomEvent = undefined;
      assert.doesNotThrow( () => {
        createCustomEvent('cat');
      }, Error);
    }
    finally {
      window.CustomEvent = x;
    }

  });

  it('should create a CustomEvent with default init attributes', () => {
    const ce = createCustomEvent('cat');
    assert.equal(ce.type, 'cat');
    assert.equal(ce.bubbles, false);
    assert.equal(ce.cancelable, false);
    assert.equal(ce.detail, null);
  });

  it('should create a CustomEvent with bubbles:true', () => {
    const ce = createCustomEvent('cat', {bubbles: true});
    assert.equal(ce.type, 'cat');
    assert.equal(ce.bubbles, true);
    assert.equal(ce.cancelable, false);
    assert.equal(ce.detail, null);
  });

  it('should create a CustomEvent instance with a detail object', function () {
    const ce = createCustomEvent('cat', { detail: { sound: 'meow' } });
    assert.equal(ce.type, 'cat');
    assert.equal(ce.bubbles, false);
    assert.equal(ce.cancelable, false);
    assert.equal(ce.detail.sound, 'meow');
  });

  it('should work', () => {
    const ce = createCustomEvent('sound', { bubbles: false, detail: {species: 'bird', sound: 'tweet'} });

    const spy = sinon.spy();
    document.body.addEventListener('sound', spy);
    document.body.dispatchEvent(ce);
    assert.isTrue(spy.called, 'Expected custom event to fire');
  });

  it('should execute prevent default for IE11', () => {
    const listenTo = ( event ) => {
      event.preventDefault();
      assert(event.defaultPrevented).isTrue();
    };

    const x = window.CustomEvent;
    try {
      window.CustomEvent = undefined;  // Emulate IE11

      const ce = createCustomEvent('music');

      assert.isDefined(ce.preventDefault);

      const spy = sinon.spy();
      document.body.addEventListener('music', spy);
      document.body.addEventListener('music', listenTo);
      document.body.dispatchEvent(ce);
      assert.isTrue(spy.called, 'Expected custom event to fire');
    }
    finally {
      window.CustomEvent = x;
    }
  });

});

