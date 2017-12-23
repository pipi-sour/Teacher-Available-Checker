import jsdomify from 'jsdomify';
import sinon from 'sinon';
import createMockRaf from '../testutils/mock-raf';
import intervalFunction from '../../src/utils/interval-function';

const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const assert = require('chai').assert;

describe('intervalFunction', () => {
  let realRaf;
  let realCaf;
  let mockRaf;
  let rafStub;
  let clock;

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

  it('creates an interval function', () => {
    const interval = intervalFunction();
    expect(interval).to.be.a('object');
  });

  it('returns refernce to "start", "stop", "immediate" and "started"', () => {
    const intervalFn = intervalFunction();
    const {start, stop, immediate, started, interval} = intervalFn;
    expect(start).to.be.a('function');
    expect(stop).to.be.a('function');
    expect(immediate).to.be.a('function');
    expect(started).to.be.a('boolean');
    expect(interval).to.be.a('number');
  });

  it('should not start when constructed', () => {
    const interval = intervalFunction(10);
    expect(interval.started).to.be.false;
  });

  it('trigger the callback once per interval', () => {
    const interval = 40;
    const loop = intervalFunction(interval);

    let n = 0;
    loop.start( () => {
      ++n;
      return true;
    });

    clock.tick(interval);
    mockRaf.step();

    clock.tick(interval/2);
    mockRaf.step();

    clock.tick(interval/2);
    mockRaf.step();

    assert.equal(n, 2, 'Expected animation loop to be called twice');

    assert.isTrue(loop.started, 'Expected loop to run');

    loop.stop();

    assert.isFalse(loop.started, 'Expected loop to stop');
  });


  it('cancels the loop if callback return false', () => {
    let t = 0;
    let n = 0;
    const interval = 50;
    const duration = 100;

    const loop = intervalFunction(interval);

    loop.start( timeElapsed => {
      t += timeElapsed;
      ++n;

      if(t < duration) {
        return true;
      }
      else {
        return false;
      }
    });

    clock.tick(interval);
    mockRaf.step();

    assert.isTrue(loop.started, 'Expected loop to be started');

    clock.tick(interval);
    mockRaf.step();

    assert.isFalse(loop.started, 'Expected loop to be stopped');

    clock.tick(interval);
    mockRaf.step();

    clock.tick(interval);
    mockRaf.step();

    assert.equal(n, 2, 'Expected animation loop to be called twice');
    loop.stop();
  });

  it('trigger the callback twice when immediate is called', () => {
    const interval = 1000;
    let n = 0;

    const loop = intervalFunction(interval);

    loop.start( () => {
      ++n;
      return true;
    });

    loop.immediate();

    clock.tick(interval);
    mockRaf.step();

    assert.equal(n, 2, 'Expected loop to be called twice');
    loop.stop();
  });

  it('can change interval', () => {
    const intervalFn = intervalFunction();
    const startInterval = intervalFn.interval;
    intervalFn.interval = 100;

    assert.notEqual(startInterval, intervalFn.interval, 'Expected interval to change');
    assert.equal(intervalFn.interval, 100, 'Expected new interval to be 100');
  });

  it('given interval less than 1000/60ms defaults to 1000/60ms', () => {
    const intervalFn = intervalFunction();
    intervalFn.interval = 1;
    assert.equal(intervalFn.interval, 1000/60, 'Expected interval to be 1000/60ms');
  });

  it('accepts only a function as callback paramater', () => {
    const intervalFn = intervalFunction();
    expect(() => {
      intervalFn.start('foo');
    }).to.throw(TypeError);
  });

  it('can not call immediate before start', () => {
    const intervalFn = intervalFunction();
    expect(() => {
      intervalFn.immediate();
    }).to.throw(ReferenceError);
  });

});
