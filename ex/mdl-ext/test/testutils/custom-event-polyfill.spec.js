'use strict';
import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import { assert } from 'chai';
import sinon from 'sinon';

describe('CustomEvent polyfill for IE11', () => {
  let x;
  before ( () => {
    jsdomify.create('<!doctype html><html><body><div id="mount"></div></body></html>');

    // Simulate IExploder11
    x = window.CustomEvent;
    global.CustomEvent = window.CustomEvent = undefined;
    requireUncached('./custom-event-polyfill');
    global.CustomEvent = window.CustomEvent;
  });

  after ( () => {
    window.CustomEvent = x;
    jsdomify.destroy();
  });

  it('should be defined', () => {
    assert.isDefined(window.CustomEvent);
  });

  it('should create a customevent', () => {
    assert.doesNotThrow( () => {
      new window.CustomEvent('cat');
    }, Error);
  });

  it('should create a CustomEvent with default init attributes', () => {
    const ce = new CustomEvent('cat');
    assert.equal(ce.type, 'cat');
    assert.equal(ce.bubbles, false);
    assert.equal(ce.cancelable, false);
    assert.equal(ce.detail, null);
  });

  it('should create a CustomEvent with bubbles:true', () => {
    const ce = new CustomEvent('cat', {bubbles: true});
    assert.equal(ce.type, 'cat');
    assert.equal(ce.bubbles, true);
    assert.equal(ce.cancelable, false);
    assert.equal(ce.detail, null);
  });

  it('should create a CustomEvent instance with a detail object', function () {
    const ce = new CustomEvent('cat', { detail: { sound: 'meow' } });
    assert.equal(ce.type, 'cat');
    assert.equal(ce.bubbles, false);
    assert.equal(ce.cancelable, false);
    assert.equal(ce.detail.sound, 'meow');
  });

  it('should work', () => {
    const ce = new CustomEvent('sound', { bubbles: false, detail: {species: 'bird', sound: 'tweet'} });

    const spy = sinon.spy();
    document.body.addEventListener('sound', spy);
    document.body.dispatchEvent(ce);
    assert.isTrue(spy.called, 'Expected custom event to fire');
  });

  it('should execute prevent default', () => {
    const listenTo = ( event ) => {
      event.preventDefault();
      assert(event.defaultPrevented).isTrue();
    };

    const ce = new CustomEvent('music');
    assert.isDefined(ce.preventDefault);

    const spy = sinon.spy();
    document.body.addEventListener('music', spy);
    document.body.addEventListener('music', listenTo);
    document.body.dispatchEvent(ce);
    assert.isTrue(spy.called, 'Expected custom event to fire');
  });

});

