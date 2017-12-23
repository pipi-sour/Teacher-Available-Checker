import jsdomify from 'jsdomify';
import sinon from 'sinon';
import createMockRaf from '../testutils/mock-raf';
import debounceFunction from '../../src/utils/debounce-function';

const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;

describe('debounceFunction', () => {
  let realRaf;
  let realCaf;
  let mockRaf;
  let rafStub;
  let clock;
  const threshold = 250;

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

  it('creates a debounced function', () => {
    const callback = () => {};
    const debounce = debounceFunction(callback);
    expect(debounce).to.be.a('function');
  });

  it('returns refernce to "cancel" and "immediate" functions', () => {
    const callback = () => {};
    const debounce = debounceFunction(callback);
    const {cancel, immediate} = debounce();
    expect(cancel).to.be.a('function');
    expect(immediate).to.be.a('function');
  });

  it('executes callback when ready', () => {
    const callback = sinon.spy();
    const debounce = debounceFunction(callback);

    debounce();
    clock.tick(threshold/2);
    mockRaf.step();
    expect(callback.called).to.equal(false);

    clock.tick(threshold/2);
    mockRaf.step();
    expect(callback.called).to.equal(true);
  });

  it('does not execute callback when threshold is less than 1000/60ms', () => {
    const callback = sinon.spy();
    const debounce = debounceFunction(callback, 10);

    debounce();
    clock.tick(10);
    mockRaf.step();
    expect(callback.called).to.equal(false);

    clock.tick(10);
    mockRaf.step();
    expect(callback.called).to.equal(true);
  });

  it('executes callback multiple times', () => {
    const callback = sinon.spy();
    const debounce = debounceFunction(callback, 100);

    debounce();
    clock.tick(100);
    mockRaf.step();
    expect(callback.calledOnce).to.equal(true);

    debounce();
    clock.tick(100);
    mockRaf.step();
    expect(callback.calledTwice).to.equal(true);
  });

  it('cancels before ready', () => {
    const callback = sinon.spy();
    const debounce = debounceFunction(callback);

    const {cancel} = debounce();
    clock.tick(threshold/2);
    mockRaf.step();
    expect(callback.called).to.equal(false);

    cancel();
    clock.tick(threshold/2);
    mockRaf.step();
    expect(callback.called).to.equal(false);

    clock.tick(threshold);
    mockRaf.step();
    expect(callback.called).to.equal(false);
  });

  it('calls the callback twice during a threshold if "immediate" is called', () => {
    const callback = sinon.spy();
    const debounce = debounceFunction(callback);

    debounce().immediate();
    expect(callback.calledOnce).to.equal(true);

    debounce();
    clock.tick(threshold);
    mockRaf.step();
    expect(callback.calledTwice).to.equal(true);
  });

  it('accepts arguments', () => {
    let x = '';

    const callback = sinon.spy( (a, b) => {
      x = a + b;
    });
    const debounce = debounceFunction(callback);

    debounce('Aa', 'bB');
    clock.tick(threshold);
    mockRaf.step();
    expect(callback.called).to.equal(true);
    expect(x).to.equal('AabB');
  });

  it('debounces an event', () => {
    let eventFlag = undefined;
    let listener = (e) => {
      eventFlag = e;
    };
    listener = sinon.spy(listener);

    const debouncedListener = debounceFunction(listener);
    window.addEventListener('resize', debouncedListener);

    const event = new Event('resize');
    window.dispatchEvent(event);

    expect(listener.called).to.equal(false);

    clock.tick(threshold);
    mockRaf.step();
    expect(listener.called).to.equal(true);
    expect(eventFlag).to.not.equal(undefined);

    window.dispatchEvent(new Event('resize'));

    clock.tick(threshold/4);
    mockRaf.step();
    window.dispatchEvent(new Event('resize'));

    clock.tick(threshold/4);
    mockRaf.step();

    window.dispatchEvent(new Event('resize'));
    clock.tick(threshold/4);
    mockRaf.step();
    clock.tick(threshold/4);
    mockRaf.step();
    clock.tick(threshold/2);
    mockRaf.step();
    expect(listener.calledTwice).to.equal(true);

    window.removeEventListener('resize', debouncedListener);
  });

});
