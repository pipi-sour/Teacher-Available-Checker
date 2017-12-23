'use strict';

import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import {patchJsDom} from '../testutils/patch-jsdom';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import { shouldBehaveLikeAMdlComponent } from '../testutils/shared-component-behaviours';
import { spyOnKeyboardEvent } from '../testutils/spy-on-keyboard-event';
import {
  VK_ESC,
  VK_SPACE,
  VK_END,
  VK_HOME,
  VK_ARROW_LEFT,
  VK_ARROW_UP,
  VK_ARROW_RIGHT,
  VK_ARROW_DOWN
} from '../../src/utils/constants';

describe('MaterialExtLightbox', () => {

  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Accordion Fixture</title>
</head>
<body>
  <div id='mount'>
    <p>Some text filler</p>
  </div>

  <dialog class="mdlext-dialog">
    <div id="lightbox" class="mdlext-lightbox mdlext-js-lightbox mdl-card">

      <div class="mdl-card__menu">
        <button data-action="close" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
          <i class="material-icons">close</i>
        </button>
      </div>

      <figure class="mdl-card__media">
        <img src="" alt>
        <figcaption></figcaption>
      </figure>

      <footer class="mdl-card__actions mdl-card--border">
        <div class="mdl-card__supporting-text">
          <span>Image title</span>
        </div>
        <nav>
          <button data-action="first" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" title="First">
            <i class="material-icons">first_page</i>
          </button>
          <button data-action="prev" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" title="Previous">
            <i class="material-icons">chevron_left</i>
          </button>
          <button data-action="next" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" title="Next">
            <i class="material-icons">chevron_right</i>
          </button>
          <button data-action="last" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" title="Last">
            <i class="material-icons">last_page</i>
          </button>
          <button data-action="play" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" title="Play">
            <i class="material-icons">play_circle_outline</i>
          </button>
        </nav>
      </footer>
    </div>
  </dialog>

  <div id="mount-2">
  </div>
</body>
</html>`;

  const lightboxFragment = `
    <div id="lightbox-2" class="mdlext-lightbox mdlext-js-lightbox mdl-card">
    </div>`;

  before ( () => {
    patchJsDom(fixture);

    // Must load MDL after jsdom, see: https://github.com/mochajs/mocha/issues/1722
    requireUncached( 'material-design-lite/material');
    global.componentHandler = window.componentHandler;
    assert.isObject(componentHandler, 'No global MDL component handler');

    requireUncached('../../src/lightbox/lightbox');
    assert.isNotNull(window.MaterialExtLightbox, 'Expected MaterialExtAccordion not to be null');
    global.MaterialExtLightbox = window.MaterialExtLightbox;

    // Simulate open dialog
    const dialog = document.querySelector('dialog');
    dialog.setAttribute('open', '');
  });

  after ( () => {
    jsdomify.destroy();
  });

  shouldBehaveLikeAMdlComponent({
    componentName: 'MaterialExtLightbox',
    componentCssClass: 'mdlext-js-lightbox',
    newComponenrMountNodeSelector: '#mount-2',
    newComponentHtml: lightboxFragment
  });

  it('has tabindex', () => {
    const element = document.querySelector('#lightbox');
    expect(element.getAttribute('tabindex')).not.to.be.NaN;
  });

  it('has "data-action" attributes', () => {
    const elements = document.querySelectorAll('#lightbox [data-action]');
    expect(elements).to.have.length.of.at.least(1);
  });

  it('can load image', () => {
    const lightbox = document.querySelector('#lightbox');
    const img = document.querySelector('img', lightbox);

    const spy = sinon.spy();
    img.addEventListener('load', spy);

    img.src = './smiley.jpg';
    assert.isTrue(spy.called, 'Expected "action" event to fire');
  });

  it('can not click an image', () => {
    const lightbox = document.querySelector('#lightbox');
    const img = lightbox.querySelector('img');

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

  it('can drag an image', () => {
    const lightbox = document.querySelector('#lightbox');
    const img = lightbox.querySelector('img');
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
      window.dispatchEvent(event);

      event = new MouseEvent('mouseup', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 40,
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


  it('interacts with the keyboard', () => {
    const lightbox = document.querySelector('#lightbox');

    spyOnKeyboardEvent(lightbox, VK_ARROW_DOWN);
    spyOnKeyboardEvent(lightbox, VK_ARROW_UP);
    spyOnKeyboardEvent(lightbox, VK_ARROW_LEFT);
    spyOnKeyboardEvent(lightbox, VK_ARROW_RIGHT);
    spyOnKeyboardEvent(lightbox, VK_END);
    spyOnKeyboardEvent(lightbox, VK_HOME);
    spyOnKeyboardEvent(lightbox, VK_ESC);
    spyOnKeyboardEvent(lightbox, VK_SPACE);
  });

  it('listens to resize', () => {
    //const lightbox = document.querySelector('#lightbox');
    const spy = sinon.spy();
    window.addEventListener('resize', spy, true);

    try {
      const event = new Event('resize');
      window.dispatchEvent(event);
    }
    finally {
      window.removeEventListener('resize', spy);
    }
    assert.isTrue(spy.called, 'Expected "resize" event to fire');
  });

  it('listens to orientationchange', () => {
    //const lightbox = document.querySelector('#lightbox');
    const spy = sinon.spy();
    window.addEventListener('orientationchange', spy, true);

    try {
      const event = new Event('orientationchange');
      window.dispatchEvent(event);
    }
    finally {
      window.removeEventListener('orientationchange', spy, true);
    }
    assert.isTrue(spy.called, 'Expected "orientationchange" event to fire');
  });

  it('emits an "action" custom event when a button is clicked', () => {
    const lightbox = document.querySelector('#lightbox');
    const button = lightbox.querySelector('.mdl-button');
    assert.isNotNull(button, 'Expected handle to button');

    const spy = sinon.spy();
    lightbox.addEventListener('action', spy);

    const actionListener = ( event ) => {
      assert.isDefined(event.detail, 'Expected detail to be defined in event');
      assert.isDefined(event.detail.source, 'Expected detail.source to be defined in event');
    };
    lightbox.addEventListener('action', actionListener);

    try {
      // Trigger click on a button
      const evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      button.dispatchEvent(evt);
    }
    finally {
      lightbox.removeEventListener('select', spy);
      lightbox.removeEventListener('select', actionListener);
    }

    assert.isTrue(spy.called, 'Expected "action" event to fire');
  });

});
