'use strict';
import jsdomify from 'jsdomify';
import sinon from 'sinon';
import {patchJsDom} from '../testutils/patch-jsdom';
import {
  getWindowViewport,
  getParentElements,
  getScrollParents,
  isFocusable,
  isRectInsideWindowViewport,
  moveElements,
  removeChildElements,
  tether,
} from '../../src/utils/dom-utils';

import { describe, before, beforeEach, after, afterEach, it } from 'mocha';
import { expect } from 'chai';


describe('dom-utils', () => {

  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fixture</title>
  <style>
    #mount { position:relative; }
    #control-1, #control-1 > div { position:absolute; top:50px; left:50px; height:10px; width:20px; }
    #tether-1, #tether-1 > div { position:absolute; height:200px; width:150px; }
  </style>
</head>
<body>
<main id='mount'>
  <div id="control-1">
    <div></div>
  </div>

  <p>Paragraph #1</p>
  <p>Paragraph #2</p>
  <section>
    <p>Paragraph #3</p>
    <p class='foo'>Paragraph #4</p>
    <article>
      <p>Paragraph #5</p>
    </article>
  </section>
  <section>
    <p>Paragraph #6</p>
    <p class='foo'>Paragraph #7</p>
  </section>
  <section>
    <div id="tether-1">
      <div></div>
    </div>
  </section>
</main>
<div id="target">
</div>
</body>
</html>`;

  before ( () => {
    patchJsDom(fixture);
  });

  after ( () => {
    jsdomify.destroy();
  });

  describe('#removeChildElements', () => {

    afterEach( () => {
      // Restore fixture
      jsdomify.clear();
    });

    it('should remove child elements', () => {
      const element = document.querySelector('#mount');
      expect(element.children).to.not.have.lengthOf(0);
      removeChildElements(element);
      expect(element.children).to.have.lengthOf(0);
    });

    it('should remove child elements with reflow = false', () => {
      const element = document.querySelector('#mount');
      expect(element.children).to.not.have.lengthOf(0);
      removeChildElements(element, false);
      expect(element.children).to.have.lengthOf(0);
    });
  });

  describe('#moveElements', () => {

    afterEach( () => {
      jsdomify.clear();
    });

    it('should move elements into a fragment', () => {
      const src = document.querySelector('#mount');
      expect(src.children).to.not.have.lengthOf(0);

      const target = moveElements(src);
      expect(src.children).to.have.lengthOf(0);
      expect(target.children).to.not.have.lengthOf(0);
    });

    it('should move elements from source to target', () => {
      const src = document.querySelector('#mount');
      const target = document.querySelector('#target');

      expect(src.children).to.not.have.lengthOf(0);
      expect(target.children).to.have.lengthOf(0);

      moveElements(src, target);
      expect(src.children).to.have.lengthOf(0);
      expect(target.children).to.not.have.lengthOf(0);
    });
  });

  describe('#getWindowViewport', () => {
    it('should have a width and height', () => {
      const { viewportWidth, viewportHeight } = getWindowViewport();
      expect(viewportWidth).not.to.be.NaN;
      expect(viewportHeight).not.to.be.NaN;
      expect(viewportWidth).to.be.above(480);
      expect(viewportHeight).to.be.above(480);
    });
  });

  describe('#isRectInsideWindowViewport', () => {
    it('is inside viewport', () => {
      const { viewportWidth, viewportHeight } = getWindowViewport();
      expect(isRectInsideWindowViewport({top:0, left:0, bottom:viewportHeight, right:viewportWidth})).to.be.true;
    });
    it('is not inside viewport', () => {
      const { viewportWidth, viewportHeight } = getWindowViewport();
      expect(isRectInsideWindowViewport({top:-1, left:-1, bottom:viewportHeight-1, right:viewportWidth-1})).to.be.false;
      expect(isRectInsideWindowViewport({top:viewportHeight+10, left:0, bottom:viewportHeight+101, right:viewportWidth-10})).to.be.false;
    });
  });

  describe('#getScrollParents', () => {
    it('should have at least one scroll parent', () => {
      expect(getScrollParents(document.querySelector('.foo'))).to.have.length.of.at.least(1);
    });
    it('should always have document.body as one of it\'s scroll parents', () => {
      expect(getScrollParents(document.querySelector('.foo')).filter( e => e === document.body)).to.have.length.of(1);
    });
  });

  describe('#getParentElements', () => {
    it('should have two parent elements', () => {
      const from = document.querySelector('.foo');
      const to = document.querySelector('#mount');

      expect(getParentElements(from, to)).to.have.lengthOf(1);
    });
  });

  describe('#tether', () => {

    let controlElement;
    let controlElementTop;
    let controlElementLeft;
    let controlElementWidth;
    let controlElementHeight;
    let gbcrStubControl;

    let tetherElement;
    let tetherElementTop;
    let tetherElementLeft;
    let tetherElementWidth;
    let tetherElementHeight;
    let gbcrStubTether;

    beforeEach(() => {
      controlElement = document.querySelector('#control-1');
      controlElement.style.width = '40px';
      controlElement.style.height = '20px';
      controlElementTop = 10;
      controlElementLeft = 10;
      controlElementWidth = 40;
      controlElementHeight = 20;
      gbcrStubControl = sinon.stub(controlElement, 'getBoundingClientRect', () => {
        return {
          top: controlElementTop,
          left: controlElementLeft,
          width: controlElementWidth,
          height: controlElementHeight
        };
      });

      tetherElement = document.querySelector('#tether-1');
      tetherElement.style.position = 'absolute';
      tetherElement.style.width = '200px';
      tetherElement.style.height = '100px';
      tetherElementTop = 300;
      tetherElementLeft = 100;
      tetherElementWidth = 200;
      tetherElementHeight = 100;
      gbcrStubTether = sinon.stub(tetherElement, 'getBoundingClientRect', () => {
        return {
          top: tetherElementTop,
          left: tetherElementLeft,
          width: tetherElementWidth,
          height: tetherElementHeight
        };
      });
    });

    afterEach(() => {
      gbcrStubControl.restore();
      gbcrStubTether.restore();
    });


    it('should position the tether element next to the control', () => {

      // Difficult to test in JsDom
      const tetherElement = document.querySelector('#tether-1');

      const top = window.getComputedStyle(tetherElement).top;
      const left = window.getComputedStyle(tetherElement).left;

      tether(controlElement, tetherElement);

      //console.log('*****', tetherElement.offsetHeight, tetherElement.offsetWidth, window.getComputedStyle(tetherElement).width, window.getComputedStyle(tetherElement).height);

      expect(window.getComputedStyle(tetherElement).top).to.not.equal(top);
      expect(window.getComputedStyle(tetherElement).left).to.not.equal(left);

      tetherElement.style.width = '2000px';
      tetherElement.style.height = '2000px';
      tetherElementTop = 300;
      tetherElementLeft = 100;
      tetherElementWidth = 2000;
      tetherElementHeight = 2000;

      tether(controlElement, tetherElement);

      tetherElement.style.width = '400px';
      tetherElement.style.height = '2px';
      tetherElementTop = 300;
      tetherElementLeft = 100;
      tetherElementWidth = 400;
      tetherElementHeight = 2;

      tether(controlElement, tetherElement);

    });
  });

  describe('#isFocusable', () => {

    it('anchor with href is focusable', () => {
      const a = document.createElement('a');
      a.setAttribute('href', '#');
      expect(isFocusable(a)).to.true;
    });

    it('anchor without href is not focusable', () => {
      const a = document.createElement('a');
      expect(isFocusable(a)).to.false;
    });

    it('area with href is focusable', () => {
      const area = document.createElement('area');
      area.setAttribute('href', '#');
      expect(isFocusable(area)).to.true;
    });

    it('area without href is not focusable', () => {
      const area = document.createElement('area');
      expect(isFocusable(area)).to.false;
    });

    it('element with contenteditable="true" is focusable', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      expect(isFocusable(div)).to.true;
    });

    it('input, select, textarea, button, details and iframe is focusable', () => {
      // Note: document.createElement('details') does not work in jsdom
      ['input', 'select', 'textarea', 'button', 'iframe'].forEach( n => {
        const element = document.createElement(n);
        expect(isFocusable(element), `Expected ${n} to be focusable`).to.true;
      });
    });

    it('element with tabIndex = -1  is not focusable', () => {
      // Note: document.createElement('details') does not work in jsdom
      ['div', 'input', 'select', 'textarea', 'button', 'iframe'].forEach( n => {
        const element = document.createElement(n);
        element.setAttribute('tabindex', '-1');
        expect(isFocusable(element), `Expected ${n} with tabindex -1 to not be focusable`).to.false;
      });
    });

    it('div is not focusable', () => {
      const div = document.createElement('div');
      expect(isFocusable(div)).to.false;
    });

    it('div with tabIndex >= 0 is focusable', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '0');
      expect(isFocusable(div)).to.true;
    });

  });

});
