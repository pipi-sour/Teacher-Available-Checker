import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import sinon from 'sinon';
import createMockRaf from '../testutils/mock-raf';

const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;


describe('ResizeObserver', () => {

  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fixture</title>
</head>
<body>
<div id='mount'>
  <div id="div-1"></div>
  <div id="div-2"></div>
</div>
</body>
</html>`;

  let realResizeObserver;
  let realRaf;
  let realCaf;
  let mockRaf;

  before(() => {
    jsdomify.create(fixture);

    realResizeObserver = window.ResizeObserver;
    realRaf = window.requestAnimationFrame;
    realCaf = window.cancelAnimationFrame;
    mockRaf = createMockRaf();
    window.requestAnimationFrame = mockRaf.raf;
    window.cancelAnimationFrame = mockRaf.raf.cancel;
  });

  after(() => {
    window.requestAnimationFrame = realRaf;
    window.cancelAnimationFrame = realCaf;
    window.ResizeObserver = realResizeObserver;
    jsdomify.destroy();
  });

  beforeEach(() => {
    window.ResizeObserver = undefined;
    requireUncached('../../src/utils/resize-observer');
  });

  afterEach(() => {
  });

  describe('general behaviour', () => {
    let element;

    beforeEach(() => {
      element = document.querySelector('#div-1');
    });

    it('is globally available', () => {
      expect(window.ResizeObserver).not.to.be.undefined;
    });

    it('creates a new ResizeObserver', () => {
      const ro = new window.ResizeObserver(()=>{});
      expect(ro).to.be.an.instanceof(window.ResizeObserver);
    });

    it('accepts only function as constructor argument', () => {
      expect(() => {
        new window.ResizeObserver('foo');
      }).to.throw(TypeError);
    });

    it('adds a ResizeObserver instance to document.resizeObservers', () => {
      new window.ResizeObserver(()=>{});
      expect(document.resizeObservers.length).to.equal(1);
    });

    it('accepts only HTMLElement as observe argument', () => {
      const ro = new window.ResizeObserver(()=>{});
      expect(() => {
        ro.observe('bar');
      }).to.throw(TypeError);
    });

    it('has one observed element', () => {
      const ro = new window.ResizeObserver(()=>{});
      ro.observe(element);
      expect(ro.observationTargets.length).to.equal(1);
    });

    it('has only unique observed elements', () => {
      const element2 = document.querySelector('#div-2');
      const ro = new window.ResizeObserver(()=>{});
      ro.observe(element);
      ro.observe(element2);
      ro.observe(element2);
      ro.observe(element);
      ro.observe(element);
      expect(ro.observationTargets.length).to.equal(2);
    });

    it('removes unobserved elements', () => {
      const element2 = document.querySelector('#div-2');
      const ro = new window.ResizeObserver(()=>{});
      ro.observe(element);
      ro.observe(element2);
      expect(ro.observationTargets.length).to.equal(2);
      ro.unobserve(element);
      expect(ro.observationTargets.length).to.equal(1);
      expect(ro.observationTargets.find(t => t.target === element2)).to.not.be.undefined;
    });

    it('has empty obervationTargets after disconnect', () => {
      const element2 = document.querySelector('#div-2');
      const ro = new window.ResizeObserver(()=>{});
      ro.observe(element);
      ro.observe(element2);
      expect(ro.observationTargets.length).of.at.least(2);
      ro.disconnect();
      expect(ro.observationTargets.length).to.equal(0);
      expect(ro.activeTargets.length).to.equal(0);
    });

    it('removes the observer from the observation list', () => {
      const element2 = document.querySelector('#div-2');
      const ro = new window.ResizeObserver(()=>{});
      ro.observe(element);
      ro.observe(element2);
      expect(ro.observationTargets.length).of.at.least(2);
      expect(document.resizeObservers.findIndex(o => o === ro)).to.not.equal(-1);

      ro.destroy();
      expect(ro.observationTargets.length).to.equal(0);
      expect(ro.activeTargets.length).to.equal(0);
      expect(document.resizeObservers.findIndex(o => o === ro)).to.equal(-1);
    });

  });


  describe('when observing one element', () => {
    let element;
    let elementHeight;
    let elementWidth;
    let rafStub;
    let getBoundingClientRectStub;
    let callback;
    let resizeObserver;
    let clock;
    const interval = 200;

    beforeEach(() => {
      element = document.querySelector('#div-1');
      elementWidth = 0;
      elementHeight = 0;

      rafStub = sinon.stub(window, 'requestAnimationFrame', mockRaf.raf);

      getBoundingClientRectStub = sinon.stub(element, 'getBoundingClientRect', () => {
        return {
          width: elementWidth,
          height: elementHeight
        };
      });

      callback = sinon.spy();
      resizeObserver = new window.ResizeObserver(callback);
      resizeObserver.observe(element);

      clock = sinon.useFakeTimers(Date.now());
      clock.tick(interval);
    });

    afterEach(() => {
      clock.restore();
      getBoundingClientRectStub.restore();
      rafStub.restore();
    });

    it('watches the element for height changes', () => {
      expect(callback.called).to.equal(false);
      elementHeight = 10;
      mockRaf.step();

      expect(callback.called).to.equal(true);
    });

    it('watches the element for width changes', () => {
      expect(callback.called).to.equal(false);
      elementWidth = 10;
      mockRaf.step();
      expect(callback.called).to.equal(true);
    });

    it('does not dispatch when width and height do not change', () => {
      expect(callback.called).to.equal(false);

      elementWidth = 10;
      mockRaf.step();
      expect(callback.calledOnce).to.equal(true);

      mockRaf.step();
      expect(callback.calledOnce).to.equal(true);

      mockRaf.step();
      expect(callback.calledOnce).to.equal(true);
    });

    it('dispatches the callback once per requestAnimationFrame', () => {
      expect(callback.called).to.equal(false);

      elementWidth = 10;
      mockRaf.step();
      expect(callback.calledOnce).to.equal(true);

      elementWidth = 20;
      clock.tick(interval);
      mockRaf.step();
      expect(callback.calledTwice).to.equal(true);
    });

    it('stops observing after call to unobserve(element)', () => {
      resizeObserver.unobserve(element);
      elementWidth = 10;
      elementHeight = 10;

      getBoundingClientRectStub.reset();
      mockRaf.step();

      expect(callback.called).to.equal(false);
      expect(getBoundingClientRectStub.called).to.equal(false);
    });

    it('stops observing orphans', () => {
      expect(callback.called).to.equal(false);
      elementWidth = 10;
      mockRaf.step();
      expect(callback.calledOnce).to.equal(true);

      elementHeight = 20;

      const p = element.parentNode;
      const el = p.removeChild(element);

      try {
        clock.tick(interval);
        mockRaf.step();
        expect(callback.calledTwice).to.equal(false);
      }
      finally {
        p.appendChild(el);
      }
    });

    it('removes observed orphans from observationTargets', () => {

      const n = resizeObserver.observationTargets.length;
      const p = element.parentNode;
      const el = p.removeChild(element);

      try {
        clock.tick(interval);
        mockRaf.step();
        expect(resizeObserver.observationTargets.length).to.equal(n-1);
      }
      finally {
        p.appendChild(el);
      }
    });

  });

  describe('when observing many elements', () => {
    let callback;
    let elements;
    let elementWidths;
    let elementHeights;
    let mockGbcrs;
    let resizeObserver;
    let clock;
    const interval = 200;

    beforeEach( () => {
      elements = [];
      elementWidths = [];
      elementHeights = [];
      mockGbcrs = [];
      elements[0] = document.createElement('div');
      elements[1] = document.createElement('div');
      elementWidths[0] = elementWidths[1] = 0;
      elementHeights[0] = elementHeights[1] = 0;

      callback = sinon.spy();
      resizeObserver = new window.ResizeObserver(callback);

      elements.forEach((el, index) => {
        mockGbcrs[index] = sinon.stub(el, 'getBoundingClientRect', () => {
          return {
            width: elementWidths[index],
            height: elementHeights[index]
          };
        });
        document.body.appendChild(el);
        resizeObserver.observe(el);
      });

      clock = sinon.useFakeTimers(Date.now());
      clock.tick(interval);
    });

    afterEach( () => {
      clock.restore();
    });

    it('calls the callback when either element\'s size has changed', () => {
      expect(callback.called).to.equal(false);

      elementWidths[0] = 10;
      mockRaf.step();

      expect(callback.calledOnce).to.equal(true);

      elementWidths[1] = 10;
      clock.tick(interval);
      mockRaf.step();

      expect(callback.calledTwice).to.equal(true);
    });

    it('calls the callback once when both elements\' sizes have changed', () => {
      expect(callback.called).to.equal(false);

      elementWidths[0] = 10;
      elementWidths[1] = 10;

      mockRaf.step();
      expect(callback.calledOnce).to.equal(true);

      mockRaf.step();
      expect(callback.calledOnce).to.equal(true);
    });

    describe('after unobserving the first element', () => {
      beforeEach(() => {
        resizeObserver.unobserve(elements[0]);
      });

      it('stops observing that element', () => {
        elementWidths[0] = 10;
        elementHeights[0] = 10;

        mockGbcrs[0].reset();
        mockGbcrs[1].reset();
        mockRaf.step();

        expect(callback.called).to.equal(false);
        expect(mockGbcrs[0].called).to.equal(false);
      });

      it('still observes the second element', () => {
        elementWidths[1] = 10;
        elementHeights[1] = 10;

        mockGbcrs[0].reset();
        mockGbcrs[1].reset();
        clock.tick(interval);
        mockRaf.step();

        expect(callback.called).to.equal(true);
        expect(mockGbcrs[1].called).to.equal(true);
      });
    });

    describe('after unobserving the second element', () => {
      beforeEach(() => {
        resizeObserver.unobserve(elements[1]);
      });

      it('stops observing that element', () => {
        elementWidths[1] = 10;
        elementHeights[1] = 10;

        mockGbcrs[0].reset();
        mockGbcrs[1].reset();
        mockRaf.step();

        expect(callback.called).to.equal(false);
        expect(mockGbcrs[1].called).to.equal(false);
      });

      it('still observes the first element', () => {
        elementWidths[0] = 10;
        elementHeights[0] = 10;

        mockGbcrs[0].reset();
        mockGbcrs[1].reset();
        clock.tick(interval);
        clock.tick(interval);
        mockRaf.step();

        expect(callback.called).to.equal(true);
        expect(mockGbcrs[0].called).to.equal(true);
      });
    });

  });

});
