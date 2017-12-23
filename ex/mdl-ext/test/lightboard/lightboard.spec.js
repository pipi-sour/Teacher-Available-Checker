'use strict';

import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import {patchJsDom} from '../testutils/patch-jsdom';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import { removeChildElements } from '../../src/utils/dom-utils';
import { shouldBehaveLikeAMdlComponent } from '../testutils/shared-component-behaviours';
import {
  VK_ENTER,
  VK_SPACE,
  VK_END,
  VK_HOME,
  VK_ARROW_LEFT,
  VK_ARROW_UP,
  VK_ARROW_RIGHT,
  VK_ARROW_DOWN
} from '../../src/utils/constants';

describe('MaterialExtLightboard', () => {

  const SLIDE = 'mdlext-lightboard__slide';

  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Accordion Fixture</title>
</head>
<body>
<div id='mount'>
<ul id="mdlext-lightboard-1" class="mdlext-lightboard mdlext-js-lightboard">
  <li class="mdlext-lightboard__slide">
    <a href="#" class="mdlext-lightboard__slide__frame">
      <figure>
        <img src="_D802141.jpg" title="Northern goshawk with prey"/>
        <figcaption>_D802141.jpg</figcaption>
      </figure>
    </a>
  </li>
  <li class="mdlext-lightboard__slide">
    <a href="#" class="mdlext-lightboard__slide__frame">
      <figure>
        <img src="_D802591.jpg" title="Whooper swans in flight"/>
        <figcaption>_D802591.jpg</figcaption>
      </figure>
    </a>
  </li>
  <li class="mdlext-lightboard__slide">
    <a href="#" class="mdlext-lightboard__slide__frame">
      <figure>
        <img src="_D804370-3.jpg" title="European green woodpecker"/>
        <figcaption>_D804370-3.jpg</figcaption>
      </figure>
    </a>
  </li>
  <li class="mdlext-lightboard__slide">
    <a href="#" class="mdlext-lightboard__slide__frame">
      <figure>
        <img src="_D808689.jpg" title="The bridge"/>
        <figcaption>_D808689.jpg</figcaption>
      </figure>
    </a>
  </li>
  <li class="mdlext-lightboard__slide">
    <a href="#" class="mdlext-lightboard__slide__frame">
      <figure>
        <img src="_D802181.jpg" title="Landscape in blue pastel"/>
        <figcaption>_D802181.jpg</figcaption>
      </figure>
    </a>
  </li>
 </ul>
</div>
<div id="mount-2">
</div>
</body>
</html>`;

  const lightboard_with_ripple = `
<ul id="lightboard_with_ripple" class="mdlext-lightboard mdlext-js-lightboard mdl-js-ripple-effect">
  <li class="mdlext-lightboard__slide">
    <a href="#" class="mdlext-lightboard__slide__frame">
      <figure>
        <img src="_D801274.jpg" />
      </figure>
    </a>
  </li>
  <li class="mdlext-lightboard__slide">
    <a href="#" class="mdlext-lightboard__slide__frame">
      <figure>
        <img src="_D801392.jpg" />
      </figure>
    </a>
  </li>
</ul>`;

  const lightboard_without_anchor = `
<ul id="lightboard_without_anchor" class="mdlext-lightboard mdlext-js-lightboard mdl-js-ripple-effect">
  <li class="mdlext-lightboard__slide">
    <span class="mdlext-lightboard__slide__frame">
      <figure>
        <img src="_D801274.jpg" />
      </figure>
    </span>
  </li>
  <li class="mdlext-lightboard__slide">
    <span class="mdlext-lightboard__slide__frame">
      <figure>
        <img src="_D801392.jpg" />
      </figure>
    </span>
  </li>
</ul>`;

  const slide_to_insert_after_component_upgrade = `
<li class="mdlext-lightboard__slide">
  <a href="#" class="mdlext-lightboard__slide__frame">
    <figure>
      <img src="_D802181.jpg" title="Landscape in blue pastel"/>
      <figcaption>_D802181.jpg</figcaption>
    </figure>
  </a>
</li>`;

  before ( () => {
    patchJsDom(fixture);

    // Must load MDL after jsdom, see: https://github.com/mochajs/mocha/issues/1722
    requireUncached( 'material-design-lite/material');
    global.componentHandler = window.componentHandler;
    assert.isObject(componentHandler, 'No global MDL component handler');

    requireUncached('../../src/lightboard/lightboard');
    assert.isNotNull(window.MaterialExtLightboard, 'Expected MaterialExtAccordion not to be null');
    global.MaterialExtLightboard = window.MaterialExtLightboard;
  });

  after ( () => {
    jsdomify.destroy();
  });

  shouldBehaveLikeAMdlComponent({
    componentName: 'MaterialExtLightboard',
    componentCssClass: 'mdlext-js-lightboard',
    newComponenrMountNodeSelector: '#mount-2',
    newComponentHtml: lightboard_with_ripple
  });

  it('should have public methods available via widget', () => {
    const element = document.querySelector('#mdlext-lightboard-1');
    const methods = [
      'upgradeSlides',
      'command'
    ];
    methods.forEach( fn => {
      expect(element.MaterialExtLightboard[fn]).to.be.a('function');
    });
  });

  it('emits a "select" custom event when a slide is clicked', () => {
    const lightboard = document.querySelector('#mdlext-lightboard-1');
    assert.isNotNull(lightboard, 'Expected handle to lightboard');

    const slide = document.querySelector('.mdlext-lightboard__slide:nth-child(2)', lightboard);
    assert.isNotNull(slide, 'Expected handle to slide');

    const spy = sinon.spy();
    lightboard.addEventListener('select', spy);

    const selectListener = ( event ) => {
      assert.isDefined(event.detail, 'Expected detail to be defined in event');
      assert.isDefined(event.detail.source, 'Expected detail.source to be defined in event');
      assert.isTrue(event.detail.source.classList.contains('mdlext-lightboard__slide'), 'Expected detail.source to have class "mdlext-lightboard__slide"');
    };
    lightboard.addEventListener('select', selectListener);

    try {
      // Trigger click on a slide
      const evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      slide.dispatchEvent(evt);
    }
    finally {
      lightboard.removeEventListener('select', spy);
      lightboard.removeEventListener('select', selectListener);
    }

    assert.isTrue(spy.called, 'Expected "select" event to fire');
  });

  it('should not emit a "select" custom event when lightboard is clicked', () => {
    const lightboard = document.querySelector('#mdlext-lightboard-1');

    const spy = sinon.spy();
    lightboard.addEventListener('select', spy);
    const selectListener = ( /* event */ ) => {
      assert.fail('select', null, 'Did not expect "select" event to fire');
    };
    lightboard.addEventListener('select', selectListener);

    try {
      // Trigger click on a slide
      const evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      lightboard.dispatchEvent(evt);
    }
    finally {
      lightboard.removeEventListener('select', spy);
      lightboard.removeEventListener('select', selectListener);
    }

    assert.isFalse(spy.called, 'Did not expect "select" event to fire');
  });

  it('has attribute aria-selected="true" when selected', () => {
    const lightboard = document.querySelector('#mdlext-lightboard-1');
    assert.isNotNull(lightboard, 'Expected handle to lightboard');

    const slide = lightboard.querySelector('.mdlext-lightboard__slide:nth-child(3)');
    assert.isNotNull(slide, 'Expected handle to slide');

    const spy = sinon.spy();
    lightboard.addEventListener('select', spy);


    const selectListener = () => {
      //const slide = event.detail.source;
      //assert.isNotNull(slide.getAttribute('aria-selected'), 'Expected slide to have attribute "aria-selected"');
      //assert.equal(slide.getAttribute('aria-selected'), 'true', 'Expected slide to have aria-selected="true"');

      const selectList = [...lightboard.querySelectorAll('.mdlext-lightboard__slide')]
        .filter( slide => slide.hasAttribute('aria-selected'));

      assert.equal(selectList.length, 1, 'Expected only one slide to have attribute "aria-selected"');
    };
    lightboard.addEventListener('select', selectListener);

    try {
      // Trigger click on a slide
      const evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      slide.dispatchEvent(evt);
    }
    finally {
      lightboard.removeEventListener('select', selectListener);
      lightboard.removeEventListener('select', spy);
    }
    assert.isTrue(spy.called, 'Expected "select" event to fire');
  });

  it('has role="grid"', () => {
    [...document.querySelectorAll('.mdlext-lightboard')].forEach( lightboard => {
      assert.equal(lightboard.getAttribute('role'), 'grid', 'Expected lightboard to have role="grid');
    });
  });

  it('lightboard slides has role="gridcell"', () => {
    [...document.querySelectorAll('.mdlext-lightboard__slide')].forEach( slide => {
      assert.equal(slide.getAttribute('role'), 'gridcell', 'Expected slide to have role="gridcell"');
    });
  });

  it('has slides with anchor', () => {
    [...document.querySelectorAll('.mdlext-lightboard__slide')].forEach( slide => {
      assert.isNotNull(slide.querySelector('a'), 'Expected slide to have an anchor element');
    });
  });

  it('has ripple effect', () => {
    const container = document.querySelector('#mount-2');
    try {
      container.insertAdjacentHTML('beforeend', lightboard_with_ripple);
      const element = document.querySelector('#lightboard_with_ripple');
      componentHandler.upgradeDom();

      const dataUpgraded = element.getAttribute('data-upgraded');
      assert.isNotNull(dataUpgraded, 'Expected attribute "data-upgraded" to exist');
      assert.isAtLeast(dataUpgraded.indexOf('MaterialRipple'), 0, 'Expected "data-upgraded" attribute to contain "MaterialRipple');

      [...document.querySelectorAll('#mount-2 a.mdlext-lightboard__slide__frame')].forEach( a => {
        const dataUpgraded = a.getAttribute('data-upgraded');
        assert.isNotNull(dataUpgraded, 'Expected attribute "data-upgraded" to exist');
        assert.isAtLeast(dataUpgraded.indexOf('MaterialRipple'), 0, 'Expected "data-upgraded" attribute to contain "MaterialRipple');
      });
    }
    finally {
      removeChildElements(container);
    }
  });

  it('upgrades inserted slides', () => {
    const container = document.querySelector('#mount-2');
    try {
      container.insertAdjacentHTML('beforeend', lightboard_with_ripple);
      const element = document.querySelector('#lightboard_with_ripple');
      componentHandler.upgradeDom();

      // Insert a new slide
      element.insertAdjacentHTML('beforeend', slide_to_insert_after_component_upgrade);

      const insertedSlide = element.querySelector('.mdlext-lightboard__slide:last-child');
      assert.isFalse(insertedSlide.hasAttribute('role'), 'Slide should not have attribute "role" before upgraded');

      element.MaterialExtLightboard.upgradeSlides();

      [...document.querySelectorAll('#mount-2 .mdlext-lightboard .mdlext-lightboard__slide')].forEach( slide => {
        assert.equal(slide.getAttribute('role'), 'gridcell', 'Expected slide to have role="gridcell"');

        const a = slide.querySelector('.mdlext-lightboard__slide__frame');
        const dataUpgraded = a.getAttribute('data-upgraded');
        assert.isNotNull(dataUpgraded, 'Expected attribute "data-upgraded" to exist');
        assert.isAtLeast(dataUpgraded.indexOf('MaterialRipple'), 0, 'Expected "data-upgraded" attribute to contain "MaterialRipple');
      });
    }
    finally {
      removeChildElements(container);
    }
  });

  it('interacts with the keyboard', () => {
    const lightboard = document.querySelector('#mdlext-lightboard-1');
    assert.isNotNull(lightboard, 'Expected handle to lightboard');
    lightboard.removeEventListener('select', lightboard);

    const slide = lightboard.querySelector('.mdlext-lightboard__slide:nth-child(3)');
    assert.isNotNull(slide, 'Expected handle to slide #3');

    spyOnKeyboardEvent(lightboard, slide, VK_ARROW_DOWN);
    spyOnKeyboardEvent(lightboard, slide, VK_ARROW_UP);
    spyOnKeyboardEvent(lightboard, slide, VK_ARROW_LEFT);
    spyOnKeyboardEvent(lightboard, slide, VK_ARROW_RIGHT);
    spyOnKeyboardEvent(lightboard, slide, VK_END);
    spyOnKeyboardEvent(lightboard, slide, VK_HOME);
    spyOnKeyboardEvent(lightboard, slide, VK_ENTER);
    spyOnKeyboardEvent(lightboard, slide, VK_SPACE);
  });

  it('listens to "command" custom events', () => {
    const lightboard = document.querySelector('#mdlext-lightboard-1');
    spyOnCommandEvent(lightboard, 'first');
    spyOnCommandEvent(lightboard, 'last');
    spyOnCommandEvent(lightboard, 'next');
    spyOnCommandEvent(lightboard, 'prev');
    spyOnCommandEvent(lightboard, 'upgrade');

    const slide = lightboard.querySelector(`.${SLIDE}:first-child`);
    spyOnCommandEvent(lightboard, 'select', slide);
  });

  it('has aria-selected="true" when selcted via custom event', () => {
    const lightboard = document.querySelector('#mdlext-lightboard-1');
    const slide = lightboard.querySelector(`.${SLIDE}:first-child`);
    slide.removeAttribute('aria-selected');

    spyOnCommandEvent(lightboard, 'select', slide);
    assert.equal(slide.getAttribute('aria-selected'), 'true', 'Expected slide to have aria-selected="true"');
  });

  it('accepts commands', () => {
    const lightboard = document.querySelector('#mdlext-lightboard-1');
    expect( () => {
      lightboard.MaterialExtLightboard.command( {action: 'first'} );
      lightboard.MaterialExtLightboard.command( {action: 'last'} );
      lightboard.MaterialExtLightboard.command( {action: 'prev'} );
      lightboard.MaterialExtLightboard.command( {action: 'next'} );
      lightboard.MaterialExtLightboard.command( {action: 'first'} );
      lightboard.MaterialExtLightboard.command( {action: 'upgrade'} );

      const slide = lightboard.querySelector(`.${SLIDE}:nth-child(2)`);
      lightboard.MaterialExtLightboard.command( {action: 'select', target: slide} );

    }).to.not.throw(Error);
  });

  it('throws error if unknown command', () => {
    const lightboard = document.querySelector('#mdlext-lightboard-1');
    expect( () => {
      lightboard.MaterialExtLightboard.command( {action: 'foo-bar-baz'} );
    }).to.throw(Error);
  });

  it('can focus', () => {
    const lightboard = document.querySelector('#mdlext-lightboard-1');
    const slide = lightboard.querySelector(`.${SLIDE}:nth-child(2)`);
    expect( () => {
      slide.dispatchEvent(
        new Event('focus', {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
    }).to.not.throw(Error);
  });

  it('works without anchor element', () => {
    const container = document.querySelector('#mount-2');
    try {
      container.insertAdjacentHTML('beforeend', lightboard_without_anchor);
      const element = document.querySelector('#lightboard_without_anchor');

      expect( () => {
        componentHandler.upgradeDom();
      }).to.not.throw(Error);

      assert.isNotNull(element, 'Expected handle to lightboard');

    }
    finally {
      removeChildElements(container);
    }
  });


  function spyOnKeyboardEvent(target, source, keyCode, shiftKey=false) {
    const spy = sinon.spy();
    target.addEventListener('keydown', spy, true);

    try {
      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        keyCode: keyCode,
        shiftKey: shiftKey,
        view: window
      });
      source.dispatchEvent(event);
    }
    finally {
      target.removeEventListener('keydown', spy);
    }

    assert.isTrue(spy.calledOnce, `Expected "keydown" event to fire once for key code ${keyCode}`);
  }

  const spyOnCommandEvent = (lightboard, action, target = undefined) => {
    const spy = sinon.spy();
    lightboard.addEventListener('command', spy);
    try {
      const event = new CustomEvent('command', { detail: { action : action, target: target } });
      lightboard.dispatchEvent(event);
    }
    finally {
      lightboard.removeEventListener('select', spy);
    }
    assert.isTrue(spy.calledOnce, `Expected "command" event to fire once for action ${action}`);
  };

});
