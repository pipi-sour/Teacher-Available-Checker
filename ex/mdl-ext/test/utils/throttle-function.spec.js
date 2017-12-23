import jsdomify from 'jsdomify';
import sinon from 'sinon';
import createMockRaf from '../testutils/mock-raf';
import throttleFunction from '../../src/utils/throttle-function';

const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;

describe('throttleFunction', () => {

  let realRaf;
  let realCaf;
  let mockRaf;
  let rafStub;
  let clock;
  const interval = 1000/60;

  before ( () => {
    jsdomify.create('<!doctype html><html><body><div id="mount"></div></body></html>');
    realRaf = window.requestAnimationFrame;
    realCaf = window.cancelAnimationFrame;
    mockRaf = createMockRaf();
    window.requestAnimationFrame = mockRaf.raf;
    window.cancelAnimationFrame = mockRaf.raf.cancel;
    rafStub = sinon.stub(window, 'requestAnimationFrame', mockRaf.raf);
    clock = sinon.useFakeTimers(Date.now());
  });

  after ( () => {
    clock.restore();
    rafStub.restore();
    window.requestAnimationFrame = realRaf;
    window.cancelAnimationFrame = realCaf;
    jsdomify.destroy();
  });

  it('creates a throttled function', () => {
    const callback = () => {};
    const throttle = throttleFunction(callback);
    expect(throttle).to.be.a('function');
  });

  it('returns refernce to "cancel" and "immediate" functions', () => {
    const callback = () => {};
    const throttle = throttleFunction(callback);
    const {cancel, immediate} = throttle();
    expect(cancel).to.be.a('function');
    expect(immediate).to.be.a('function');
  });

  it('executes callback when ready', () => {
    const callback = sinon.spy();
    const throttle = throttleFunction(callback);

    throttle();
    expect(callback.called).to.equal(false);

    clock.tick(interval);
    mockRaf.step();
    expect(callback.called).to.equal(true);
  });

  it('accepts arguments', () => {
    let x = '';

    const callback = sinon.spy( (a, b) => {
      x = a + b;
    });
    const throttle = throttleFunction(callback);

    throttle('Aa', 'bB');
    clock.tick(interval);
    mockRaf.step();
    expect(callback.called).to.equal(true);
    expect(x).to.equal('AabB');
  });

  it('does not execute callback when interval is less than 1000/60ms', () => {
    const callback = sinon.spy();
    const throttle = throttleFunction(callback, 10);

    throttle();
    clock.tick(1);
    mockRaf.step();
    expect(callback.called).to.equal(false);

    clock.tick(16);
    mockRaf.step();
    expect(callback.called).to.equal(true);
  });

  it('cancels before ready', () => {
    const callback = sinon.spy();
    const throttle = throttleFunction(callback, 1000);

    const {cancel} = throttle();
    clock.tick(500);
    mockRaf.step();
    expect(callback.called).to.equal(false);

    cancel();
    clock.tick(500);
    mockRaf.step();
    expect(callback.called).to.equal(false);
  });

  it('calls the callback twice during an interval if "immediate" is called', () => {
    const callback = sinon.spy();
    const throttle = throttleFunction(callback);

    throttle().immediate();
    expect(callback.calledOnce).to.equal(true);

    throttle();
    clock.tick(interval);
    mockRaf.step();
    expect(callback.calledTwice).to.equal(true);
  });

  it('throttles an event', () => {
    let eventFlag = undefined;
    let listener = (e) => {
      eventFlag = e;
    };
    listener = sinon.spy(listener);

    const throttledListener = throttleFunction(listener);
    window.addEventListener('resize', throttledListener);

    const event = new Event('resize');
    window.dispatchEvent(event);

    expect(listener.called).to.equal(false);

    clock.tick(interval);
    mockRaf.step();
    expect(listener.called).to.equal(true);
    expect(eventFlag).to.not.equal(undefined);

    window.dispatchEvent(new Event('resize'));
    clock.tick(interval);
    mockRaf.step();
    expect(listener.calledTwice).to.equal(true);

    window.removeEventListener('resize', throttledListener);
  });

});
