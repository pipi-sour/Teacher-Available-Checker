import jsdomify from 'jsdomify';
import sinon from 'sinon';
import createMockRaf from '../testutils/mock-raf';
import fullThrottle from '../../src/utils/full-throttle';

const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;

describe('fullThrottle', () => {
  let realRaf;
  let realCaf;
  let mockRaf;
  let stub;

  before ( () => {
    jsdomify.create('<!doctype html><html><body><div id="mount"></div></body></html>');
    realRaf = window.requestAnimationFrame;
    realCaf = window.cancelAnimationFrame;
    mockRaf = createMockRaf();
    window.requestAnimationFrame = mockRaf.raf;
    window.cancelAnimationFrame = mockRaf.raf.cancel;
    stub = sinon.stub(window, 'requestAnimationFrame', mockRaf.raf);

  });

  after ( () => {
    stub.restore();
    window.requestAnimationFrame = realRaf;
    window.cancelAnimationFrame = realCaf;
    jsdomify.destroy();
  });

  it('creates a throttled function', () => {
    const callback = () => {};
    const throttle = fullThrottle(callback);
    expect(throttle).to.be.a('function');
  });

  it('executes callback when ready', () => {
    const callback = sinon.spy();
    const throttle = fullThrottle(callback);

    throttle();
    expect(callback.called).to.equal(false);

    mockRaf.step();
    expect(callback.called).to.equal(true);
  });

  it('accepts arguments', () => {
    let x = '';

    const callback = sinon.spy( (a, b) => {
      x = a + b;
    });
    const throttle = fullThrottle(callback);

    throttle('Aa', 'bB');
    mockRaf.step();
    expect(callback.called).to.equal(true);
    expect(x).to.equal('AabB');
  });

  it('throttles an event', () => {
    let eventFlag = undefined;
    let listener = (e) => {
      eventFlag = e;
    };
    listener = sinon.spy(listener);

    const throttledListener = fullThrottle(listener);
    window.addEventListener('resize', throttledListener);

    const event = new Event('resize');
    window.dispatchEvent(event);

    expect(listener.called).to.equal(false);
    mockRaf.step();
    expect(listener.called).to.equal(true);
    expect(eventFlag).to.not.equal(undefined);

    window.removeEventListener('resize', throttledListener);
  });

});
