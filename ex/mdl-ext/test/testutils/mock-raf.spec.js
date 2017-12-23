// Tests based on code from: https://github.com/lukastaegert/mock-raf/blob/master/test/test.js

import jsdomify from 'jsdomify';
import sinon from 'sinon';
import createMockRaf from './mock-raf';

const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const assert = require('chai').assert;

describe('mock-raf', () => {

  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fixture</title>
</head>
<body>
</body>
</html>`;

  let mockRaf;

  before ( () => {
    jsdomify.create(fixture);
    mockRaf = createMockRaf();
  });

  after ( () => {
    jsdomify.destroy();
  });

  it('should call all callbacks when calling step', () => {
    const callback1 = sinon.stub();
    const callback2 = sinon.stub();
    mockRaf.raf(callback1);
    mockRaf.raf(callback2);
    mockRaf.step();
    expect(callback1.called).to.be.true;
    expect(callback2.called).to.be.true;
  });

  it('should remove the callbacks once they have been called', () => {
    const callback = sinon.stub();
    mockRaf.raf(callback);
    mockRaf.step();
    callback.reset();
    mockRaf.step();
    expect(callback.notCalled).to.be.true;
  });

  it('should remove all callbacks when calling cancel without arguments', () => {
    const callback = sinon.stub();
    mockRaf.raf(callback);
    mockRaf.raf.cancel();
    mockRaf.step();
    expect(callback.called).to.be.true;
  });

  it('should only remove the specified callback when calling cancel with a callback ID', () => {
    const callback1 = sinon.stub();
    const callback2 = sinon.stub();
    const id1 = mockRaf.raf(callback1);
    mockRaf.raf(callback2);
    mockRaf.raf.cancel(id1);
    mockRaf.step();
    expect(callback1.notCalled).to.be.true;
    expect(callback2.called).to.be.true;
  });

  it('should advance the mocked time coordinate when calling step', () => {
    const initialTime = mockRaf.now();
    mockRaf.step(1);
    assert.equal(initialTime + 1000/60, mockRaf.now());
  });

  it('should advance the mocked time coordinate when calling step with 100ms interval', () => {
    const initialTime = mockRaf.now();
    mockRaf.step(1, 100);
    assert.equal(Math.floor(initialTime)+100, mockRaf.now());
  });

  it('should properly advance time for several steps', () => {
    const initialTime = mockRaf.now();
    mockRaf.step(2, 1);
    assert.equal(initialTime + 2, mockRaf.now());
  });

  it('should call the callback after 100ms', () => {
    const callback = sinon.stub();
    mockRaf.raf(callback);
    mockRaf.step(1, 100);
    expect(callback.calledOnce).to.be.true;
  });

  it('should call the callbacks only once for several steps', () => {
    const callback = sinon.stub();
    mockRaf.raf(callback);
    mockRaf.step(2);
    expect(callback.calledOnce).to.be.true;
  });

  it('should call the callback twice', () => {
    const callback = sinon.stub();
    mockRaf.raf(callback);
    mockRaf.step();

    mockRaf.raf(callback);
    mockRaf.step();
    expect(callback.calledTwice).to.be.true;
  });

  it('should only remove callbacks which have been called', () => {
    const callback2 = sinon.stub();
    const callback1 = () => {
      mockRaf.raf(callback2);
    };
    mockRaf.raf(callback1);
    mockRaf.step();
    assert(callback2.notCalled);
    mockRaf.step();
    assert(callback2.called);
  });

  describe('when stubbing window.requestAnimationFrame', () => {
    let realRaf;
    let realCaf;

    before ( () => {
      realRaf = window.requestAnimationFrame;
      realCaf = window.cancelAnimationFrame;
      window.requestAnimationFrame = mockRaf.raf;
      window.cancelAnimationFrame = mockRaf.raf.cancel;
    });

    after ( () => {
      window.requestAnimationFrame = realRaf;
      window.cancelAnimationFrame = realCaf;
    });

    it('stubs window.requestAnimationFrame', () => {
      const rafStub = sinon.stub(window, 'requestAnimationFrame', mockRaf.raf);

      window.requestAnimationFrame( () => {
      });

      mockRaf.step();
      expect(rafStub.calledOnce).to.be.true;

      rafStub.restore();
    });


    it('runs a rAF loop', () => {

      const RafLoop = () => {
        const executeCallback = () => {
          poll(executeCallback);
        };

        const poll = callback => {
          window.requestAnimationFrame(callback);
        };

        return {
          run() {
            poll(executeCallback);
          }
        };
      };

      const rafStub = sinon.stub(window, 'requestAnimationFrame', mockRaf.raf);

      RafLoop().run();
      expect(rafStub.calledOnce).to.be.true;

      mockRaf.step();
      expect(rafStub.calledTwice).to.be.true;

      mockRaf.step(2);
      expect(rafStub.callCount).to.equal(4);

      mockRaf.step(1, 200);
      expect(rafStub.callCount).to.equal(5);

      rafStub.restore();
    });

  });

});
