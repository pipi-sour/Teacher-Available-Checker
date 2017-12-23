'use strict';
import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import {patchJsDom} from '../testutils/patch-jsdom';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import { removeChildElements } from '../../src/utils/dom-utils';
import createMockRaf from '../testutils/mock-raf';
import { shouldBehaveLikeAMdlComponent } from '../testutils/shared-component-behaviours';
import { spyOnKeyboardEvent } from '../testutils/spy-on-keyboard-event';

import {
  VK_TAB,
  VK_ENTER,
  VK_ESC,
  VK_SPACE,
  VK_PAGE_UP,
  VK_PAGE_DOWN,
  VK_END,
  VK_HOME,
  VK_ARROW_LEFT,
  VK_ARROW_UP,
  VK_ARROW_RIGHT,
  VK_ARROW_DOWN
} from '../../src/utils/constants';

describe('MaterialExtCarousel', () => {

  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Carousel Fixture</title>
</head>
<body>
<div id='mount'>
  <ul class="mdlext-carousel mdlext-js-carousel">
    <li class="mdlext-carousel__slide">
      <figure>
        <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
      </figure>
    </li>
  </ul>

  <ul id="carousel-1" class="mdlext-carousel mdlext-js-carousel">
    <li class="mdlext-carousel__slide">
      <figure>
        <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
      </figure>
    </li>
    <li class="mdlext-carousel__slide">
      <figure>
        <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
      </figure>
    </li>
    <li class="mdlext-carousel__slide">
      <figure>
        <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
      </figure>
    </li>
  </ul>
  
</div>
<div id='mount-2'>
</div>
</body>
</html>`;

  const fragment = `
<ul id="carousel-2" class="mdlext-carousel mdlext-js-carousel mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
  <li class="mdlext-carousel__slide">
    <figure>
      <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
    </figure>
  </li>
  <li class="mdlext-carousel__slide">
    <figure>
      <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
    </figure>
  </li>
</ul>`;

  const data_config_fragment_single_quotes = `
<ul id="carousel-3" class="mdlext-carousel mdlext-js-carousel mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events" 
  data-config="{ 'interactive': true, 'autostart': false, 'type': 'scroll', 'interval': 5000 }">
  <li class="mdlext-carousel__slide">
    <figure>
      <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
    </figure>
  </li>
  <li class="mdlext-carousel__slide">
    <figure>
      <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
    </figure>
  </li>
</ul>`;

  const data_config_fragment_double_quotes = `
<ul id="carousel-5" class="mdlext-carousel mdlext-js-carousel mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events" 
  data-config='{ "interactive": false, "autostart": false, "type": "slide", "interval": 2000 }'>
  <li class="mdlext-carousel__slide">
    <figure>
      <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
    </figure>
  </li>
  <li class="mdlext-carousel__slide">
    <figure>
      <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
    </figure>
  </li>
</ul>`;

  const data_config_with_malformed_format_fragment = `
<ul id="carousel-4" class="mdlext-carousel mdlext-js-carousel mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events" 
  data-config="{ 'interactive: false, 'autostart': true, 'type': 'scroll', 'interval': 5000 }">
  <li class="mdlext-carousel__slide">
    <figure>
      <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
    </figure>
  </li>
  <li class="mdlext-carousel__slide">
    <figure>
      <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
    </figure>
  </li>
</ul>`;

  const carousel_slide_fragment = `
<li class="mdlext-carousel__slide">
  <figure>
    <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
  </figure>
</li>`;


  let realRaf;
  let realCaf;
  let mockRaf;
  let rAFStub;

  before ( () => {
    patchJsDom(fixture);

    // Must load MDL after jsdom, see: https://github.com/mochajs/mocha/issues/1722
    requireUncached( 'material-design-lite/material');
    global.componentHandler = window.componentHandler;
    assert.isObject(componentHandler, 'Expected a global MDL component handler');

    requireUncached('../../src/carousel/carousel');
    assert.isNotNull(window.MaterialExtCarousel, 'Expected MaterialExtCarousel not to be null');
    global.MaterialExtCarousel = window.MaterialExtCarousel;

    realRaf = window.requestAnimationFrame;
    realCaf = window.cancelAnimationFrame;
    mockRaf = createMockRaf();
    window.requestAnimationFrame = mockRaf.raf;
    window.cancelAnimationFrame = mockRaf.raf.cancel;
    rAFStub = sinon.stub(window, 'requestAnimationFrame', mockRaf.raf);
  });

  after ( () => {
    rAFStub.restore();
    window.requestAnimationFrame = realRaf;
    window.cancelAnimationFrame = realCaf;
    jsdomify.destroy();
  });

  shouldBehaveLikeAMdlComponent({
    componentName: 'MaterialExtCarousel',
    componentCssClass: 'mdlext-js-carousel',
    newComponenrMountNodeSelector: '#mount-2',
    newComponentHtml: fragment
  });

  // role=list, A section containing listitem elements.
  it('has role="list"', () => {
    [...document.querySelectorAll('.mdlext-carousel')].forEach( carousel => {
      assert.equal(carousel.getAttribute('role'), 'list', 'Expected carousel to have role="list"');
    });
  });

  // role=listitem, A single item in a list or directory.
  it('has slides with role="listitem"', () => {
    [...document.querySelectorAll('.mdlext-carousel__slide')].forEach( slide => {
      assert.equal(slide.getAttribute('role'), 'listitem', 'Expected slide to have role="listitem"');
    });
  });

  it('should have public methods available via widget', () => {
    const el = document.querySelector('.mdlext-carousel');
    const methods = [
      'stopAnimation',
      'upgradeSlides',
      'getConfig'
    ];
    methods.forEach((method) => {
      expect(el.MaterialExtCarousel[method]).to.be.a('function');
    });
  });

  it('can call public methodes', () => {
    const el = document.querySelector('.mdlext-carousel');
    el.MaterialExtCarousel.stopAnimation();
    el.MaterialExtCarousel.upgradeSlides();
    el.MaterialExtCarousel.getConfig();
  });

  it('has ripple effect', () => {
    const container = document.querySelector('#mount-2');
    try {
      container.insertAdjacentHTML('beforeend', fragment);
      const element = document.querySelector('#carousel-2');
      componentHandler.upgradeDom();

      const dataUpgraded = element.getAttribute('data-upgraded');
      assert.isNotNull(dataUpgraded, 'Expected attribute "data-upgraded" to exist');
      assert.isAtLeast(dataUpgraded.indexOf('MaterialRipple'), 0, 'Expected "data-upgraded" attribute to contain "MaterialRipple');

      [...document.querySelectorAll('#mount-2 mdlext-carousel__slide')].forEach( slide => {

        const ripple = slide.querySelector('.mdlext-carousel__slide__ripple-container');
        assert.isNotNull(ripple, 'Expected ripple to exist');

        const dataUpgraded = ripple.getAttribute('data-upgraded');
        assert.isNotNull(dataUpgraded, 'Expected attribute "data-upgraded" to exist');
        assert.isAtLeast(dataUpgraded.indexOf('MaterialRipple'), 0, 'Expected "data-upgraded" attribute to contain "MaterialRipple');
      });
    }
    finally {
      removeChildElements(container);
    }
  });


  it('upgrades dynamically inserted slides', () => {
    const container = document.querySelector('#mount-2');
    try {
      container.insertAdjacentHTML('beforeend', fragment);
      const element = document.querySelector('#carousel-2');

      componentHandler.upgradeDom();

      // Insert a new slide after component has been upgraded
      element.insertAdjacentHTML('beforeend', carousel_slide_fragment);
      element.MaterialExtCarousel.upgradeSlides();

      [...document.querySelectorAll('#mount-2 mdlext-carousel__slide')].forEach( slide => {

        const ripple = slide.querySelector('.mdlext-carousel__slide__ripple-container');
        assert.isNotNull(ripple, 'Expected ripple to exist');

        const dataUpgraded = ripple.getAttribute('data-upgraded');
        assert.isNotNull(dataUpgraded, 'Expected attribute "data-upgraded" to exist');
        assert.isAtLeast(dataUpgraded.indexOf('MaterialRipple'), 0, 'Expected "data-upgraded" attribute to contain "MaterialRipple');

        assert.equal(slide.getAttribute('role'), 'listitem', 'Expected slide to have role="listitem"');
        assert.equal(slide.getAttribute('tabindex'), '0', 'Expected slide to have tabindex="0"');
      });
    }
    finally {
      removeChildElements(container);
    }
  });

  it('interacts with the keyboard', () => {
    const carousel = document.querySelector('#carousel-1');
    [...carousel.querySelectorAll('.mdlext-carousel__slide[aria-selected]')].forEach(
      slide => slide.removeAttribute('aria-selected')
    );
    const slide = carousel.querySelector('.mdlext-carousel__slide:nth-child(1)');
    slide.setAttribute('aria-selected', '');

    spyOnKeyboardEvents(slide, [
      VK_ARROW_DOWN, VK_ARROW_UP, VK_ARROW_LEFT, VK_ARROW_RIGHT,
      VK_ESC, VK_SPACE, VK_TAB, VK_ENTER,
      VK_PAGE_DOWN, VK_PAGE_UP, VK_END, VK_HOME,
    ]);
    spyOnKeyboardEvent(slide, VK_TAB, true);
  });

  it('listens to "command" custom events', () => {
    const carousel = document.querySelector('#carousel-1');
    [...carousel.querySelectorAll('.mdlext-carousel__slide[aria-selected]')].forEach(
      slide => slide.removeAttribute('aria-selected')
    );
    carousel.querySelector('.mdlext-carousel__slide:nth-child(1)').setAttribute('aria-selected', '');

    spyOnCommandEvent(carousel, 'first');
    spyOnCommandEvent(carousel, 'scroll-prev');
    spyOnCommandEvent(carousel, 'prev');
    spyOnCommandEvent(carousel, 'next');
    spyOnCommandEvent(carousel, 'scroll-next');
    spyOnCommandEvent(carousel, 'last');
    spyOnCommandEvent(carousel, 'pause');

    // Play has it's own test
    //ev = new CustomEvent('command', { detail: { action : 'play', interval: 1000 } });
    //carousel.dispatchEvent(ev);
  });

  it('listens to focus and blur events', () => {
    const carousel = document.querySelector('#carousel-1');
    const slide = carousel.querySelector('.mdlext-carousel__slide:nth-child(1)');
    spyOnEvent('focus', slide);
    spyOnEvent('blur', slide);
  });


  it('disables click on image', () => {
    const carousel = document.querySelector('.mdlext-carousel');
    const img = carousel.querySelector('img');

    const spy = sinon.spy();
    img.addEventListener('click', spy);

    const event = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    });

    try {
      img.dispatchEvent(event);
    }
    finally {
      img.removeEventListener('click', spy);
    }
    assert.isTrue(spy.called, 'Expected "click" event to fire when image is clicked');
    assert.isTrue(event.defaultPrevented, 'Expected "event.preventDefault" to be called when image is clicked');
  });

  it('can drag the carousel', () => {
    const carousel = document.querySelector('.mdlext-carousel');
    const img = carousel.querySelector('img');
    img.src = './smiley.jpg';

    const mouseDownSpy = sinon.spy();
    img.addEventListener('mousedown', mouseDownSpy, true);

    const mouseMoveSpy = sinon.spy();
    window.addEventListener('mousemove', mouseMoveSpy, true);

    const mouseUpSpy = sinon.spy();
    window.addEventListener('mouseup', mouseUpSpy, true);

    try {
      let event = new MouseEvent('mousedown', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 10, // clientX/clientY is readonly...
        'clientY': 0   // ... not shure if I can test mouse movement
      });
      img.dispatchEvent(event);

      event = new MouseEvent('mousemove', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 20,
        'clientY': 0
      });
      carousel.dispatchEvent(event);
      mockRaf.step(1);

      carousel.dispatchEvent(new MouseEvent('mousemove', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 100,
        'clientY': 0
      }));
      mockRaf.step(1);

      carousel.dispatchEvent(new MouseEvent('mousemove', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 200,
        'clientY': 0
      }));
      mockRaf.step(1);

      carousel.dispatchEvent(new MouseEvent('mousemove', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 300,
        'clientY': 0
      }));
      mockRaf.step(1);

      carousel.dispatchEvent(new MouseEvent('mousemove', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 400,
        'clientY': 0
      }));
      mockRaf.step(1);

      carousel.dispatchEvent(new MouseEvent('mousemove', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 500,
        'clientY': 0
      }));
      mockRaf.step(1);

      carousel.dispatchEvent(new MouseEvent('mousemove', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 501,
        'clientY': 0
      }));
      mockRaf.step(1);

      event = new MouseEvent('mouseup', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 501,
        'clientY': 0
      });
      window.dispatchEvent(event);
    }
    finally {
      img.removeEventListener('mousedown', mouseDownSpy);
      window.removeEventListener('mousemove', mouseMoveSpy);
      window.removeEventListener('mouseup', mouseUpSpy);
    }
    assert.isTrue(mouseDownSpy.called, 'Expected "mousedown" event to fire');
    assert.isTrue(mouseMoveSpy.called, 'Expected "mousemove" event to fire');
    assert.isTrue(mouseUpSpy.called, 'Expected "mouseup" event to fire');
  });


  it('emits a "select" event if drag distance is less than 2px', () => {
    const carousel = document.querySelector('.mdlext-carousel');
    const img = carousel.querySelector('img');
    img.src = './smiley.jpg';

    const spy = sinon.spy();
    carousel.addEventListener('select', spy);

    try {
      let event = new MouseEvent('mousedown', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 10, // clientX/clientY is readonly...
        clientY: 0  // ... not shure if I can test mouse movement
      });
      img.dispatchEvent(event);

      event = new MouseEvent('mouseup', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 11,
        clientY: 0
      });
      window.dispatchEvent(event);
    }
    finally {
      carousel.removeEventListener('select', spy);
    }
    assert.isTrue(spy.called, 'Expected "select" event to fire');
  });


  it('has attribute "aria-selected" when selected', () => {
    const carousel = document.querySelector('#carousel-1');
    assert.isNotNull(carousel, 'Expected handle to carousel');

    const slide = carousel.querySelector('.mdlext-carousel__slide:nth-child(2)');
    assert.isNotNull(slide, 'Expected handle to slide');
    slide.focus();

    const spy = sinon.spy();
    carousel.addEventListener('select', spy);

    const selectListener = () => {
      const selectList = [...carousel.querySelectorAll('.mdlext-carousel__slide')].filter(
        slide => slide.hasAttribute('aria-selected')
      );
      assert.equal(selectList.length, 1, 'Expected only one slide to have attribute "aria-selected"');
    };
    carousel.addEventListener('select', selectListener);

    try {
      // Trigger enter key on a slide
      const evt = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        keyCode: VK_ENTER,
        shiftKey: false,
        view: window
      });

      slide.dispatchEvent(evt);
    }
    finally {
      carousel.removeEventListener('select', selectListener);
      carousel.removeEventListener('select', spy);
    }
    assert.isTrue(spy.called, 'Expected "select" event to fire');
  });

  it('listens to "command" custom event and answers with a "select" custom event', (done) => {
    const carousel = document.querySelector('#carousel-1');
    const slide = carousel.querySelector('.mdlext-carousel__slide:nth-child(1)');
    slide.setAttribute('aria-selected', '');

    const spy = sinon.spy();
    carousel.addEventListener('select', spy);

    const selectListener = () => {
      done();
    };
    carousel.addEventListener('select', selectListener);

    try {
      const ev = new CustomEvent('command', { detail: { action : 'next' } } );
      carousel.dispatchEvent(ev);
    }
    finally {
      carousel.removeEventListener('select', selectListener);
      carousel.removeEventListener('select', spy);
    }
    assert.isTrue(spy.called, 'Expected "select" event to fire');
  });


  it('reads "data-config" attribute and stores config data', () => {
    const container = document.querySelector('#mount-2');
    container.insertAdjacentHTML('beforeend', data_config_fragment_single_quotes);

    try {
      const element = document.querySelector('#carousel-3');
      expect(() => {
        componentHandler.upgradeElement(element, 'MaterialExtCarousel');
      }).to.not.throw(Error);

      const c = element.MaterialExtCarousel.getConfig();
      expect(c.interactive).to.be.true;
      expect(c.autostart).to.be.false;
      expect(c.type).to.equal('scroll');
      expect(c.interval).to.equal(5000);
      expect(c.animationLoop).to.not.be.null;
    }
    finally {
      removeChildElements(container);
    }
  });

  it('accepts "data-config" attribute with double quotes', () => {
    const container = document.querySelector('#mount-2');
    container.insertAdjacentHTML('beforeend', data_config_fragment_double_quotes);

    try {
      const element = document.querySelector('#carousel-5');
      expect(() => {
        componentHandler.upgradeElement(element, 'MaterialExtCarousel');
      }).to.not.throw(Error);

      const c = element.MaterialExtCarousel.getConfig();
      expect(c.interactive).to.be.false;
      expect(c.autostart).to.be.false;
      expect(c.type).to.equal('slide');
      expect(c.interval).to.equal(2000);
      expect(c.animationLoop).to.not.be.null;
    }
    finally {
      removeChildElements(container);
    }
  });

  it('throws an error if "data-config" attribute is malformed', () => {
    const container = document.querySelector('#mount-2');
    container.insertAdjacentHTML('beforeend', data_config_with_malformed_format_fragment);

    try {
      const element = document.querySelector('#carousel-4');
      expect(() => {
        componentHandler.upgradeElement(element, 'MaterialExtCarousel');
      }).to.throw(Error);
    }
    finally {
      removeChildElements(container);
    }
  });

  it('can play slides', () => {
    const carousel = document.querySelector('#carousel-1');
    carousel.scrollLeft = 0;
    carousel.style.width = '100px';

    const spy = sinon.spy();
    carousel.addEventListener('select', spy);

    /*
    const selectListener = ( event ) => {
      console.log('*****', event);
    };
    carousel.addEventListener('select', selectListener);
    */

    let ev = new CustomEvent('command', { detail: { action : 'play', type: 'slide', interval: 100 } } );
    carousel.dispatchEvent(ev);
    mockRaf.step(300);

    assert.isAtLeast(spy.callCount, 2, 'Expected "select" event to fire more than once');
    const c = carousel.MaterialExtCarousel.getConfig();
    expect(c.interval).to.equal(100);

    ev = new CustomEvent('command', { detail: { action : 'play', type: 'scroll', interval: 100 } } );
    carousel.dispatchEvent(ev);
    mockRaf.step(100);
  });

  it('can scroll slides', () => {
    const carousel = document.querySelector('#carousel-1');
    carousel.scrollLeft = 0;
    carousel.style.width = '100px';

    const event = new CustomEvent('command', { detail: { action : 'scroll-prev' } });
    carousel.dispatchEvent(event);
    mockRaf.step(100);

    assert.notEqual(carousel.scrollLeft, 0);
  });

  it('cleans up after itself', () => {
    const container = document.querySelector('#mount-2');
    container.insertAdjacentHTML('beforeend', data_config_fragment_double_quotes);

    const element = document.querySelector('#carousel-5');
    const spy = sinon.spy();

    try {
      expect(() => {
        componentHandler.upgradeElement(element, 'MaterialExtCarousel');
      }).to.not.throw(Error);

      const ev = new CustomEvent('command', { detail: { action : 'play', type: 'slide', interval: 100 } } );
      element.dispatchEvent(ev);

      let c = element.MaterialExtCarousel.getConfig();
      assert.isTrue(c.animationLoop.started, 'Expected animation to run before carousel downgrade');

      element.addEventListener('mdl-componentdowngraded', spy);

      componentHandler.downgradeElements(element);

      assert.isTrue(spy.calledOnce, 'Expected "mdl-componentdowngraded" event to fire after call to "componentHandler.downgradeElements"');

      c = element.MaterialExtCarousel.getConfig();
      assert.isFalse(c.animationLoop.started, 'Expected animation to stop after carousel downgrade');
    }
    finally {
      element.removeEventListener('mdl-componentdowngraded', spy);
      removeChildElements(container);
    }
  });


  function spyOnEvent(name, target) {
    const spy = sinon.spy();
    target.addEventListener(name, spy);

    const evt = new Event(name, {
      bubbles: true,
      cancelable: true,
      view: window
    });
    target.dispatchEvent(evt);
    target.removeEventListener(name, spy);
    assert.isTrue(spy.calledOnce, `Expected event ${name} to fire once`);
  }

  const spyOnKeyboardEvents = (target, keyCodes) => {
    keyCodes.forEach( keyCode => spyOnKeyboardEvent(target, keyCode));
  };

  function spyOnCommandEvent(target, action) {
    const spy = sinon.spy();
    target.addEventListener('command', spy);
    try {
      const event = new CustomEvent('command', { detail: { action : action } });
      target.dispatchEvent(event);
    }
    finally {
      target.removeEventListener('command', spy);
    }
    assert.isTrue(spy.calledOnce, `Expected "command" event to fire once for action ${action}`);
  }

});
