'use strict';

import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import {patchJsDom} from '../testutils/patch-jsdom';
import { removeChildElements } from '../../src/utils/dom-utils';
import createMockRaf from '../testutils/mock-raf';
import {
  VK_TAB,
  VK_ENTER,
  VK_ESC,
  VK_SPACE,
  VK_PAGE_UP,
  VK_END,
  VK_HOME,
  VK_ARROW_LEFT,
  VK_ARROW_UP,
  VK_ARROW_RIGHT,
  VK_ARROW_DOWN,
  //IS_FOCUSED,
} from '../../src/utils/constants';

import * as domUtils from '../../src/utils/dom-utils';

const describe = require('mocha').describe;
const before = require('mocha').before;
const after = require('mocha').after;
const beforeEach = require('mocha').beforeEach;
const it = require('mocha').it;
const expect = require('chai').expect;
const assert = require('chai').assert;
const sinon = require('sinon');

import { shouldBehaveLikeAMdlComponent } from '../testutils/shared-component-behaviours';

const MENU_BUTTON = 'mdlext-js-menu-button';
const MENU_BUTTON_MENU = 'mdlext-menu';
const MENU_BUTTON_MENU_ITEM = 'mdlext-menu__item';
const MENU_BUTTON_MENU_ITEM_SEPARATOR = 'mdlext-menu__item-separator';

describe('MaterialExtMenuButton', () => {

  const menu_button_fixture = `
<div role="presentation">
  <button class="mdlext-js-menu-button">
    <span class="mdlext-menu-button__label">I'm the label!</span>
  </button>
  <ul class="mdlext-menu">
    <li class="mdlext-menu__item">Menu item #1</li>
    <li class="mdlext-menu__item">Menu item #2</li>
    <li class="mdlext-menu__item">Menu item #n</li>
  </ul>
</div>`;

  const menu_button_with_disabled_item_fixture = `
<div role="presentation">
  <button class="mdlext-js-menu-button">
    <span class="mdlext-menu-button__label">I'm the label!</span>
  </button>
  <ul class="mdlext-menu">
    <li class="mdlext-menu__item">Menu item #1</li>
    <li class="mdlext-menu__item">Menu item #2</li>
    <li class="mdlext-menu__item-separator"></li>
    <li class="mdlext-menu__item" disabled>Menu item #3</li>
    <li class="mdlext-menu__item">Menu item #n</li>
  </ul>
</div>`;

  const disabled_menu_button_fixture = `
<div role="presentation">
  <button class="mdlext-js-menu-button" disabled>
    <span class="mdlext-menu-button__label">I'm disabled!</span>
  </button>
  <ul class="mdlext-menu">
    <li class="mdlext-menu__item">Menu item #1</li>
  </ul>
</div>`;

  const menu_button_with_aria_fixture = `
<button class="mdlext-js-menu-button"
        aria-controls="menu-example-dropdown"
        role="button"
        aria-haspopup="true"
        aria-expanded="false">
  <span class="mdlext-menu-button__label">I'm the label!</span>
</button>
<ul id="menu-example-dropdown"
    class="mdlext-menu"
    role="menu"
    hidden>
  <li class="mdlext-menu__item" role="menuitem">Menu item #1</li>
  <li class="mdlext-menu__item" role="menuitem">Menu item #2</li>
  <li class="mdlext-menu__item" role="menuitem">Menu item #n</li>
</ul>`;

  const menu_button_with_embedded_focusable_element = `
<div role="presentation">
  <div class="mdl-textfield mdl-js-textfield mdlext-js-menu-button">
    <input class="mdl-textfield__input" type="text" readonly>
    <label class="mdl-textfield__label">Text...</label>
  </div>
  <ul class="mdlext-menu">
    <li class="mdlext-menu__item" data-value="twitter">
      <span class="mdlext-menu__item__caption">Item #1</span>
    </li>
    <li class="mdlext-menu__item" data-value="github">
      <span class="mdlext-menu__item__caption">Item #2</span>
    </li>
    <li class="mdlext-menu__item" data-value="github">
      <span class="mdlext-menu__item__caption">Item #3</span>
    </li>
  </ul>
</div>`;

  const menu_button_without_focusable_element = `
<div role="presentation">
  <div class="mdl-textfield mdl-js-textfield mdlext-js-menu-button">
  </div>
  <ul class="mdlext-menu">
    <li class="mdlext-menu__item" data-value="twitter">
      <span class="mdlext-menu__item__caption">Item #1</span>
    </li>
    <li class="mdlext-menu__item" data-value="github">
      <span class="mdlext-menu__item__caption">Item #2</span>
    </li>
    <li class="mdlext-menu__item" data-value="github">
      <span class="mdlext-menu__item__caption">Item #3</span>
    </li>
  </ul>
</div>`;

  const menu_buttons_with_shared_menu = `
<button class="mdl-button mdl-js-button mdlext-js-menu-button" aria-controls="shared-menu">
  <span class="mdlext-menu-button__caption">A button</span>
</button>

<div class="mdl-textfield mdl-js-textfield mdlext-js-menu-button" aria-controls="shared-menu">
  <input class="mdl-textfield__input" type="text" readonly>
  <label class="mdl-textfield__label">A MDL textfield</label>
</div>

<ul id="shared-menu" class="mdlext-menu" hidden>
  <li class="mdlext-menu__item" role="menuitem">Menu item #1</li>
  <li class="mdlext-menu__item" role="menuitem">Menu item #2</li>
  <li class="mdlext-menu__item" role="menuitem">Menu item #n</li>
</ul>`;


  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>menu Button Fixture</title>
</head>
<body>
<main>
  <div class="mdl-layout__content">
    <div id="default-fixture">
      ${menu_button_fixture}
    </div>
    <div id="aria-fixture">
      ${menu_button_with_aria_fixture}
    </div>
    <div id="mount">
    </div>
  </div>
</main>
</body>
</html>`;

  let getScrollParentsStub;

  before ( () => {
    patchJsDom(fixture);

    // Must load MDL after jsdom, see: https://github.com/mochajs/mocha/issues/1722
    requireUncached( 'material-design-lite/material');
    global.componentHandler = window.componentHandler;
    assert.isObject(componentHandler, 'Expected global MDL component handler');

    requireUncached('../../src/menu-button/menu-button');
    assert.isNotNull(window.MaterialExtMenuButton, 'Expected MaterialExtMenuButton not to be null');
    global.MaterialExtMenuButton = window.MaterialExtMenuButton;

    // window.getComputedStyle(element) in getScrollParents is extremely slow in JsDom
    getScrollParentsStub = sinon.stub(domUtils, 'getScrollParents', (el) => [document.body, el ? el.parentNode : null]);
  });

  after ( () => {
    jsdomify.destroy();
    sinon.restore(getScrollParentsStub);
  });

  describe('General behaviour', () => {

    shouldBehaveLikeAMdlComponent({
      componentName: 'MaterialExtMenuButton',
      componentCssClass: 'mdlext-js-menu-button',
      newComponenrMountNodeSelector: '#mount',
      newComponentHtml: menu_button_fixture
    });

    it('should have public methods available via widget', () => {
      const component = document.querySelector(`#default-fixture .${MENU_BUTTON}`);
      const methods = [
        'openMenu',
        'closeMenu',
        'getMenuElement',
        'getSelectedMenuItem',
        'setSelectedMenuItem'
      ];
      methods.forEach( fn => {
        expect(component.MaterialExtMenuButton[fn]).to.be.a('function');
      });
    });

    it('should have "is-upgraded" class on menu when upgraded successfully', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_button_fixture);
        const component = container.querySelector(`.${MENU_BUTTON}`);

        componentHandler.upgradeElement(component, 'MaterialExtMenuButton');

        const menu = document.querySelector(`#${component.getAttribute('aria-controls')}`);
        assert.isTrue(menu.classList.contains('is-upgraded'), 'Expected menu element to have class "is-upgraded" after upgrade');

        componentHandler.downgradeElements(component);
      }
      finally {
        removeChildElements(container);
      }
    });

    it('should move the menu to document.body when upgraded successfully, then move menu back to original parent after downgrade', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_button_fixture);
        const component = container.querySelector(`.${MENU_BUTTON}`);

        const menu = component.parentNode.querySelector(`.${MENU_BUTTON_MENU}`);
        assert.isNotNull(menu, 'Expected a menu');

        const parentNode = menu.parentNode;
        assert.notEqual(parentNode, document.body, 'Did not expect menu to be a child of document.body before upgrade');

        componentHandler.upgradeElement(component, 'MaterialExtMenuButton');
        assert.equal(menu.parentNode, document.body, 'Expected menu to be a child of document.body after upgrade');

        componentHandler.downgradeElements(component);
        assert.equal(menu.parentNode, parentNode, 'Expected menu to be moved back to original parent node after downgrade');
      }
      finally {
        removeChildElements(container);
      }
    });

    it('receives a "mdl-componentdowngraded" custom event', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_button_fixture);
        const component = container.querySelector(`.${MENU_BUTTON}`);

        componentHandler.upgradeElement(component, 'MaterialExtMenuButton');

        const spy = sinon.spy();
        component.addEventListener('mdl-componentdowngraded', spy);
        componentHandler.downgradeElements(component);
        assert.isTrue(spy.calledOnce, 'Expected "mdl-componentdowngraded" event to fire after call to "componentHandler.downgradeElements"');
      }
      finally {
        removeChildElements(container);
      }
    });

    it('should return the menu element controlled by the button', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_button_fixture);
        const component = container.querySelector(`.${MENU_BUTTON}`);

        componentHandler.upgradeElement(component, 'MaterialExtMenuButton');

        const menu = document.querySelector(`#${component.getAttribute('aria-controls')}`);
        const menuReturnedByApi = component.MaterialExtMenuButton.getMenuElement();
        assert.equal(menu, menuReturnedByApi, 'Expected menu element returned from api to be equal to queried menu element');

        componentHandler.downgradeElements(component);
      }
      finally {
        removeChildElements(container);
      }
    });

    it('should share menu with another button', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_buttons_with_shared_menu);
        const [...components] = container.querySelectorAll(`.${MENU_BUTTON}`);

        assert.equal(components.length, 2, 'Expected two buttons');

        componentHandler.upgradeElement(components[0], 'MaterialExtMenuButton');
        componentHandler.upgradeElement(components[1], 'MaterialExtMenuButton');

        components.forEach( c =>
          assert.isTrue(c.classList.contains('is-upgraded'), `Expected "${MENU_BUTTON}" to have class "is-upgraded"`)
        );

        assert.equal(components[0].MaterialExtMenuButton.getMenuElement(),
          components[1].MaterialExtMenuButton.getMenuElement(), 'Expected buttons to share a menu');

        componentHandler.downgradeElements(components);
      }
      finally {
        removeChildElements(container);
      }
    });

    it('should not downgrade menu before last button sharing that menu is downgraded', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_buttons_with_shared_menu);
        const components = container.querySelectorAll(`.${MENU_BUTTON}`);
        const menu = document.querySelector('#shared-menu');

        assert.isNotNull(menu, 'Expected a menu');
        assert.equal(components.length, 2, 'Expected two buttons');

        componentHandler.upgradeElement(components[0], 'MaterialExtMenuButton');
        componentHandler.upgradeElement(components[1], 'MaterialExtMenuButton');

        assert.isTrue(menu.classList.contains('is-upgraded'), 'Expected menu to have class "is-upgraded"');

        componentHandler.downgradeElements(components[0]);
        assert.isTrue(menu.classList.contains('is-upgraded'), 'Expected menu to have class "is-upgraded" after downgrading first menu button');

        componentHandler.downgradeElements(components[1]);
        assert.isFalse(menu.classList.contains('is-upgraded'), 'Expected menu to not have class "is-upgraded" after downgrading second menu button');
      }
      finally {
        removeChildElements(container);
      }
    });

  });


  describe('WAI-ARIA', () => {

    it('has appended all the required WAI-ARIA attributes', () => {
      const button = document.querySelector(`#default-fixture .${MENU_BUTTON}`);
      assert.isNotNull(button, 'Expected menu button not to be null');

      const menu = button.MaterialExtMenuButton.getMenuElement();
      assert.isNotNull(menu, 'Expected menu button menu not to be null');

      assert.equal(button.getAttribute('role'), 'button', 'Expected menu button to have role="button"');
      assert.equal(button.getAttribute('aria-haspopup'), 'true', 'Expected menu button to have aria-haspoput="true"');
      assert.isTrue(button.hasAttribute('aria-controls'), 'Expected menu button to have attribute "aria-controls"');
      assert.equal(button.getAttribute('aria-controls'), menu.id, 'Menu button aria-controls has wrong value');

      assert.isTrue(button.hasAttribute('aria-expanded'), 'Expected menu button to have attribute "aria-expanded"');
      assert.equal(menu.getAttribute('role'), 'menu', 'Expected menu button menu to have role="menu"');

      [...menu.querySelectorAll('.mdlext-menu-button__menu__item')].forEach( menuitem => {
        assert.equal(menuitem.getAttribute('role'), 'menuitem', 'Expected menu button menu item to have role="menuitem"');
      });

      const menuItems = menu.querySelectorAll(`.${MENU_BUTTON_MENU_ITEM}`);
      assert.isAtLeast(menuItems.length, 1, 'Expected menu button menu to have at leaset one menu item');
    });

    it('should have "tabindex=0" if the menu button does not have a focusable element', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_button_without_focusable_element);
        const button = container.querySelector(`.${MENU_BUTTON}`);
        componentHandler.upgradeElement(button, 'MaterialExtMenuButton');
        assert.isTrue(button.hasAttribute('tabindex'), 'Expected menu button button to not have attribute "tabindex"');
      }
      finally {
        removeChildElements(container);
      }
    });

    it('should not have a tabindex if the menu button is a focusable element, or if an embedded element is focusable', () => {
      let button = document.querySelector(`#default-fixture .${MENU_BUTTON}`);
      assert.isFalse(button.hasAttribute('tabindex'), 'Expected menu button button to not have attribute "tabindex"');

      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_button_with_embedded_focusable_element);
        button = container.querySelector(`.${MENU_BUTTON}`);
        componentHandler.upgradeElement(button, 'MaterialExtMenuButton');
        assert.isFalse(button.hasAttribute('tabindex'), 'Expected menu button button to not have attribute "tabindex"');
      }
      finally {
        removeChildElements(container);
      }
    });

    it('should have a menu separator with role="separator"', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_button_with_disabled_item_fixture);
        const button = container.querySelector(`.${MENU_BUTTON}`);
        const menu = container.querySelector(`.${MENU_BUTTON_MENU}`);
        componentHandler.upgradeElement(button, 'MaterialExtMenuButton');

        const separatorItem = menu.querySelector(`.${MENU_BUTTON_MENU_ITEM_SEPARATOR}`);
        assert.isNotNull(separatorItem, `Expected menu item with class ${MENU_BUTTON_MENU_ITEM_SEPARATOR}`);
        assert.equal(separatorItem.getAttribute('role'), 'separator', 'Expected menu item to have role="separator"');
      }
      finally {
        removeChildElements(container);
      }
    });

  });

  describe('Button interactions', () => {

    let button;
    let menu;

    beforeEach( () => {
      button = document.querySelector(`#default-fixture .${MENU_BUTTON}`);
      assert.isNotNull(button, 'Expected menu button menu not to be null');

      menu = button.MaterialExtMenuButton.getMenuElement();
      assert.isNotNull(menu, 'Expected menu button menu not to be null');

      [...menu.querySelectorAll(`.${MENU_BUTTON_MENU_ITEM}[aria-selected="true"]`)]
        .forEach(selectedItem => selectedItem.removeAttribute('aria-selected'));
    });

    it('toggles the menu when button is clicked', () => {
      //let d = new Date();
      //console.log('***** getScrollParents, after ', new Date() - d, elements.length);


      button.MaterialExtMenuButton.closeMenu();

      // Trigger click event to toggle menu
      dispatchMouseEvent(button, 'click');
      assert.equal(button.getAttribute('aria-expanded'), 'true', 'Mouse click when menu is closed: Expected button to have aria-expanded=true');
      assert.isFalse(menu.hasAttribute('hidden'), 'Mouse click when menu is closed: Expected menu to not have hidden attribute');

      dispatchMouseEvent(button, 'click');
      assert.equal(button.getAttribute('aria-expanded'), 'false', 'Mouse click when menu is open: Expected button to have aria-expanded=false');
      assert.isTrue(menu.hasAttribute('hidden'), 'Mouse click when menu is closed: Expected menu to have hidden attribute');
    });

    it('opens the menu when button is clicked and move focus to the first menu item', () => {
      button.MaterialExtMenuButton.closeMenu();

      // Trigger click event to toggle menu
      dispatchMouseEvent(button, 'click');
      assert.equal(button.getAttribute('aria-expanded'), 'true', 'Mouse click: Expected button to have aria-expanded=true');
      assert.isFalse(menu.hasAttribute('hidden'), 'Mouse click: Expected menu to not have hidden attribute');
      assert.equal(menu.firstElementChild, document.activeElement, 'Mouse click: Expected first menu item to have focus');
    });

    it('opens the menu when button is clicked and move focus to a previously selected menu item', () => {
      button.MaterialExtMenuButton.closeMenu();
      const selectedItem = menu.children[1];
      button.MaterialExtMenuButton.setSelectedMenuItem(selectedItem);

      // Trigger click event to toggle menu
      dispatchMouseEvent(button, 'click');
      const n = button.MaterialExtMenuButton.getSelectedMenuItem();
      assert.equal(n, document.activeElement, 'Mouse click: Expected second menu item to have focus');
    });

    it('opens the menu when Enter or Space key is pressed and move focus to the first menu item', () => {
      button.MaterialExtMenuButton.closeMenu();
      button.MaterialExtMenuButton.setSelectedMenuItem(null);
      dispatchKeyDownEvent(button, VK_SPACE);
      assert.equal(button.getAttribute('aria-expanded'), 'true', 'Space key: Expected button to have aria-expanded=true');
      assert.isFalse(menu.hasAttribute('hidden'), 'Space key: Expected menu to not have hidden attribute');
      assert.equal(menu.firstElementChild, document.activeElement, 'Space key: Expected first menu item to have focus');

      button.MaterialExtMenuButton.closeMenu();
      button.MaterialExtMenuButton.setSelectedMenuItem(null);
      dispatchKeyDownEvent(button, VK_ENTER);
      assert.equal(button.getAttribute('aria-expanded'), 'true', 'Enter key: Expected button to have aria-expanded=true');
      assert.isFalse(menu.hasAttribute('hidden'), 'Enter key: Expected menu to not have hidden attribute');
      assert.equal(menu.firstElementChild, document.activeElement, 'Enter key: Expected first menu item to have focus');
    });

    it('opens the menu when Enter or Space key is pressed and move focus to the previously selected menu item', () => {
      button.MaterialExtMenuButton.closeMenu();
      const selectedItem = menu.children[1];
      button.MaterialExtMenuButton.setSelectedMenuItem(selectedItem);

      dispatchKeyDownEvent(button, VK_SPACE);
      let n = button.MaterialExtMenuButton.getSelectedMenuItem();
      assert.equal(n, document.activeElement, 'Space key: Expected second menu item to have focus');

      button.MaterialExtMenuButton.closeMenu();
      dispatchKeyDownEvent(button, VK_ENTER);
      n = button.MaterialExtMenuButton.getSelectedMenuItem();
      assert.equal(n, document.activeElement, 'Enter key: Expected second menu item to have focus');
    });

    it('opens the menu and move focus to the last menu item when arrow up key is pressed', () => {
      button.MaterialExtMenuButton.closeMenu();
      dispatchKeyDownEvent(button, VK_ARROW_UP);
      assert.equal(button.getAttribute('aria-expanded'), 'true', 'Arrow up key: Expected button to have aria-expanded=true');
      assert.isFalse(menu.hasAttribute('hidden'), 'Arrow up key: Expected menu to not have hidden attribute');
      assert.equal(menu.lastElementChild, document.activeElement, 'Arrow up key: Expected last menu item to have focus');
    });

    it('opens the menu and move focus to the first menu item when arrow down key is pressed', () => {
      button.MaterialExtMenuButton.closeMenu();
      dispatchKeyDownEvent(button, VK_ARROW_DOWN);
      assert.equal(button.getAttribute('aria-expanded'), 'true', 'Arrow down key: Expected button to have aria-expanded=true');
      assert.isFalse(menu.hasAttribute('hidden'), 'Arrow down key: Expected menu to not have hidden attribute');
      assert.equal(menu.firstElementChild, document.activeElement, 'Arrow down key: Expected first menu item to have focus');
    });

    it('closes the menu when tab key is pressed', () => {
      button.MaterialExtMenuButton.openMenu();
      dispatchKeyDownEvent(button, VK_TAB);
      assert.equal(button.getAttribute('aria-expanded'), 'false', 'Tab key: Expected button to have aria-expanded=false');
      assert.isTrue(menu.hasAttribute('hidden'), 'Tab key: Expected menu to have hidden attribute');
    });

    it('closes the menu when esc key is pressed', () => {
      button.MaterialExtMenuButton.openMenu('first');
      dispatchKeyDownEvent(button, VK_ESC);
      assert.equal(button.getAttribute('aria-expanded'), 'false', 'ESC key: Expected button to have aria-expanded=false');
      assert.isTrue(menu.hasAttribute('hidden'), 'ESC key: Expected menu to have hidden attribute');
    });

    it('should close an already open menu when another menu button is clicked', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_buttons_with_shared_menu);
        const [...buttons] = container.querySelectorAll(`.${MENU_BUTTON}`);

        assert.equal(buttons.length, 2, 'Expected two buttons');

        componentHandler.upgradeElement(buttons[0], 'MaterialExtMenuButton');
        componentHandler.upgradeElement(buttons[1], 'MaterialExtMenuButton');

        buttons[0].MaterialExtMenuButton.closeMenu();
        buttons[1].MaterialExtMenuButton.closeMenu();

        dispatchMouseEvent(buttons[0], 'click');
        assert.equal(buttons[0].getAttribute('aria-expanded'), 'true', 'Expected button 1 to have an open menu');
        assert.equal(buttons[1].getAttribute('aria-expanded'), 'false', 'Expected button 2 to be closed');

        // Does not behave like in a real browser, must close programatically
        const m = document.querySelector(`#${buttons[0].getAttribute('aria-controls')}`);

        // 1. Reset document.activeElement
        m.blur();

        // 2. Send an event to call handlers
        m.dispatchEvent( new Event( 'blur' ) );

        // 3. Programmatically close
        buttons[0].MaterialExtMenuButton.closeMenu();

        // Then click
        dispatchMouseEvent(buttons[1], 'click');

        assert.equal(buttons[0].getAttribute('aria-expanded'), 'false', 'Expected button 1 to not have an open menu after clicking button 2');
        assert.equal(buttons[1].getAttribute('aria-expanded'), 'true', 'Expected button 2 to be open after clicking that button');

        componentHandler.downgradeElements(buttons);
      }
      finally {
        removeChildElements(container);
      }
    });

    it('does nothing when an "undefined" key i pressed', () => {
      expect( () => {
        dispatchKeyDownEvent(button, VK_PAGE_UP);
      }).to.not.throw(Error);
    });

    it('does nothing when menu button is disabled', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', disabled_menu_button_fixture);
        button = container.querySelector(`.${MENU_BUTTON}`);
        menu = container.querySelector(`.${MENU_BUTTON_MENU}`);
        componentHandler.upgradeElement(button, 'MaterialExtMenuButton');

        button.MaterialExtMenuButton.openMenu();
        assert.equal(menu.hasAttribute('hidden'), true, 'Expected disabled menu button not to open the menu');

        dispatchKeyDownEvent(button, VK_ARROW_DOWN);
        assert.equal(menu.hasAttribute('hidden'), true, 'Expected disabled menu button not to open the menu');

        dispatchKeyDownEvent(button, VK_ARROW_UP);
        assert.equal(menu.hasAttribute('hidden'), true, 'Expected disabled menu button not to open the menu');

        dispatchKeyDownEvent(button, VK_ENTER);
        assert.equal(menu.hasAttribute('hidden'), true, 'Expected disabled menu button not to open the menu');

        dispatchKeyDownEvent(button, VK_SPACE);
        assert.equal(menu.hasAttribute('hidden'), true, 'Expected disabled menu button not to open the menu');

        dispatchMouseEvent(button, 'click');
        assert.equal(menu.hasAttribute('hidden'), true, 'Expected disabled menu button not to open the menu');
      }
      finally {
        removeChildElements(container);
      }
    });

    it('re-positions the menu when content scroll', () => {
      const realRaf = window.requestAnimationFrame;
      const realCaf = window.cancelAnimationFrame;
      const mockRaf = createMockRaf();
      window.requestAnimationFrame = mockRaf.raf;
      window.cancelAnimationFrame = mockRaf.raf.cancel;
      const rAFStub = sinon.stub(window, 'requestAnimationFrame', mockRaf.raf);
      const clock = sinon.useFakeTimers(Date.now());
      const interval = 1000/60;

      let elementTop = 0;
      const elementLeft = 0;

      const gbcrStub = sinon.stub(button, 'getBoundingClientRect', () => {
        return {
          top: elementTop,
          left: elementLeft
        };
      });

      try {
        const content = document.body;
        content.scrollTop = 0;
        content.style.height = '200px';

        button.MaterialExtMenuButton.openMenu('first');

        const menuTopBeforeScroll = menu.style.top;

        elementTop = -100;
        content.scrollTop = 100;
        content.dispatchEvent(new Event('scroll'));
        clock.tick(interval);
        mockRaf.step();

        assert.notEqual(menuTopBeforeScroll, menu.style.top, 'Expected menu to reposition');
      }
      finally {
        gbcrStub.restore();
        clock.restore();
        rAFStub.restore();
        window.requestAnimationFrame = realRaf;
        window.cancelAnimationFrame = realCaf;
      }
    });
  });


  describe('Menu interactions', () => {

    let button;
    let menu;

    beforeEach( () => {
      button = document.querySelector(`#default-fixture .${MENU_BUTTON}`);
      assert.isNotNull(button, 'Expected menu button menu not to be null');

      menu = button.MaterialExtMenuButton.getMenuElement();
      assert.isNotNull(menu, 'Expected menu button menu not to be null');


      [...menu.querySelectorAll(`.${MENU_BUTTON_MENU_ITEM}[aria-selected="true"]`)]
        .forEach(selectedItem => selectedItem.removeAttribute('aria-selected'));
    });

    it('closes the menu when tab key is pressed', () => {
      button.MaterialExtMenuButton.openMenu();
      const item = menu.children[1];
      dispatchKeyDownEvent(item, VK_TAB);
      assert.isTrue(menu.hasAttribute('hidden'), 'Tab key: Expected menu to have hidden attribute');
    });

    it('closes the menu when ESC key is pressed and moves focus to button', () => {
      button.MaterialExtMenuButton.openMenu();
      const item = menu.children[0];
      dispatchKeyDownEvent(item, VK_ESC);
      assert.isTrue(menu.hasAttribute('hidden'), 'ESC key: Expected menu to have hidden attribute');
      assert.equal(button, document.activeElement, 'ESC: Expected button to have focus');
    });

    it('moves focus to previous menu item when Arrow up or Arrow left key is pressed', () => {
      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.children[1];
      selectedItem.focus();
      dispatchKeyDownEvent(selectedItem, VK_ARROW_UP);
      assert.equal(menu.children[0], document.activeElement, 'Arrow Up: Expected previous menu item have focus');

      selectedItem.focus();
      dispatchKeyDownEvent(selectedItem, VK_ARROW_LEFT);
      assert.equal(menu.children[0], document.activeElement, 'Arrow Left: Expected previous menu item have focus');
    });

    it('moves focus to next menu item when Arrow down or Arrow right key is pressed', () => {
      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.children[1];
      selectedItem.focus();
      dispatchKeyDownEvent(selectedItem, VK_ARROW_DOWN);
      assert.equal(menu.children[2], document.activeElement, 'Arrow Down: Expected next menu item have focus');

      selectedItem.focus();
      dispatchKeyDownEvent(selectedItem, VK_ARROW_RIGHT);
      assert.equal(menu.children[2], document.activeElement, 'Arrow Right: Expected next menu item have focus');
    });

    it('moves focus to first menu item when focus is on last menu item and Arrow down is pressed', () => {
      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.children[menu.children.length-1];
      selectedItem.focus();
      dispatchKeyDownEvent(selectedItem, VK_ARROW_DOWN);
      assert.equal(menu.firstElementChild, document.activeElement, 'Arrow Down: Expected first menu item have focus');
    });

    it('moves focus to first menu item when Home key is pressed', () => {
      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.children[menu.children.length-1];
      selectedItem.focus();
      dispatchKeyDownEvent(selectedItem, VK_HOME);
      assert.equal(menu.firstElementChild, document.activeElement, 'Home key: Expected first menu item have focus');
    });

    it('moves focus to last menu item when focus is on first menu item and Arrow up key is pressed', () => {
      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.firstElementChild;
      selectedItem.focus();
      dispatchKeyDownEvent(selectedItem, VK_ARROW_UP);
      assert.equal(menu.children[menu.children.length-1], document.activeElement, 'Arrow Up: Expected last menu item have focus');
    });

    it('moves focus to last menu item when End key is pressed', () => {
      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.firstElementChild;
      selectedItem.focus();
      dispatchKeyDownEvent(selectedItem, VK_END);
      assert.equal(menu.children[menu.children.length-1], document.activeElement, 'End key: Expected last menu item have focus');
    });

    it('does nothing when an "undefined" key i pressed', () => {
      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.firstElementChild;
      selectedItem.focus();
      expect( () => {
        dispatchKeyDownEvent(selectedItem, VK_PAGE_UP);
      }).to.not.throw(Error);
    });

    it('closes the menu when Enter or Space key is pressed on a menu item', () => {
      button.MaterialExtMenuButton.openMenu();
      let selectedItem = menu.children[1];
      selectedItem.focus();
      dispatchKeyDownEvent(selectedItem, VK_ENTER);
      assert.equal(menu.children[1].getAttribute('aria-selected'), 'true', 'Enter key: Expected menu item to have aria-selected="true"');
      assert.isTrue(menu.hasAttribute('hidden'), 'ESC key: Expected menu to have hidden attribute');

      button.MaterialExtMenuButton.openMenu();
      selectedItem = menu.children[0];
      selectedItem.focus();
      dispatchKeyDownEvent(selectedItem, VK_SPACE);
      assert.equal(menu.children[0].getAttribute('aria-selected'), 'true', 'Space key: Expected menu item to have aria-selected="true"');
      assert.isTrue(menu.hasAttribute('hidden'), 'ESC key: Expected menu to have hidden attribute');
    });

    it('closes the menu when menu item is clicked', () => {
      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.children[1];
      selectedItem.focus();
      dispatchMouseEvent(selectedItem, 'click');
      assert.equal(menu.children[1].getAttribute('aria-selected'), 'true', 'Mouse cick: Expected menu item to have aria-selected="true"');
      assert.isTrue(menu.hasAttribute('hidden'), 'Mouse click: Expected menu to have hidden attribute');
    });

    it('closes the menu and sets aria-expanded="false" for button and hidden attribute for menu', () => {
      button.MaterialExtMenuButton.openMenu('first');
      const item = menu.children[1];
      item.focus();
      assert.equal(button.getAttribute('aria-expanded'), 'true', 'Before closing menu: Expected button to have aria-expanded=false');
      assert.isFalse(menu.hasAttribute('hidden'), 'Before closing menu: Expected menu to have hidden attribute');

      dispatchKeyDownEvent(item, VK_ESC);
      assert.equal(button.getAttribute('aria-expanded'), 'false', 'After closing menu: Expected button to have aria-expanded=false');
      assert.isTrue(menu.hasAttribute('hidden'), 'After closing menu: Expected menu to have hidden attribute');
    });

    it('closes the menu when when clicking or touching outside the menu rect', () => {
      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.children[1];
      selectedItem.focus();
      dispatchTouchEvent(document.documentElement, 'touchstart');
      assert.isTrue(menu.hasAttribute('hidden'), 'Mouse down: Expected menu to have hidden attribute after clicking outside menu rect');
    });

    it('emits a custom select event when a menu item is clicked', () => {
      button.MaterialExtMenuButton.setSelectedMenuItem(menu.children[0]);

      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.children[1];
      selectedItem.focus();

      const spy = sinon.spy();
      button.addEventListener('menuselect', spy);

      const selectListener = event => {
        assert.isDefined(event.detail, 'Expected detail to be defined in event');
        assert.isDefined(event.detail.source, 'Expected detail.source to be defined in event');
        assert.isTrue(event.detail.source.classList.contains(MENU_BUTTON_MENU_ITEM),
          `Expected detail.source to have class "${MENU_BUTTON_MENU_ITEM}"`);
      };
      button.addEventListener('menuselect', selectListener);

      try {
        // Trigger click
        dispatchMouseEvent(selectedItem, 'click');

        const selected = button.MaterialExtMenuButton.getSelectedMenuItem();
        assert.equal(selectedItem, selected, 'Expected "button.MaterialExtMenuButton.getSelectedMenuItem()" to return the slected menu item element');
      }
      finally {
        button.removeEventListener('menuselect', spy);
        button.removeEventListener('menuselect', selectListener);
      }

      assert.isTrue(spy.called, 'Expected "select" custom event to fire');
    });

    it('should not emit a custom select event when a previously selected menu item is clicked', () => {
      button.MaterialExtMenuButton.setSelectedMenuItem(menu.children[1]);
      button.MaterialExtMenuButton.openMenu();
      const selectedItem = menu.children[1];
      selectedItem.focus();

      const spy = sinon.spy();
      button.addEventListener('menuselect', spy);
      try {
        // Trigger click
        dispatchMouseEvent(selectedItem, 'click');
      }
      finally {
        button.removeEventListener('menuselect', spy);
      }
      assert.isFalse(spy.called, 'Expected "select" custom event NOT to fire for a previously selected menu item');
    });

    it('should not emit a custom select event when a disabled menu item is clicked', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_button_with_disabled_item_fixture);
        button = container.querySelector(`.${MENU_BUTTON}`);
        menu = container.querySelector(`.${MENU_BUTTON_MENU}`);
        componentHandler.upgradeElement(button, 'MaterialExtMenuButton');

        button.MaterialExtMenuButton.openMenu();
        const disabledItem = menu.children[3];
        disabledItem.focus();

        const spy = sinon.spy();
        button.addEventListener('menuselect', spy);
        try {
          dispatchMouseEvent(disabledItem, 'click');
        }
        finally {
          button.removeEventListener('menuselect', spy);
        }
        assert.isFalse(spy.called, 'Expected "select" custom event NOT to fire for a disabled menu item');
      }
      finally {
        removeChildElements(container);
      }
    });

    it('should not focus a disabled menu item', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_button_with_disabled_item_fixture);
        button = container.querySelector(`.${MENU_BUTTON}`);
        menu = container.querySelector(`.${MENU_BUTTON_MENU}`);
        componentHandler.upgradeElement(button, 'MaterialExtMenuButton');

        button.MaterialExtMenuButton.openMenu();
        const disabledItem = menu.children[3];

        let item = menu.children[1];
        item.focus();
        dispatchKeyDownEvent(item, VK_ARROW_DOWN);
        assert.notEqual(disabledItem, document.activeElement, 'Arrow down: Did not expect a disabled menu item have focus');

        item = menu.children[4];
        item.focus();
        dispatchKeyDownEvent(item, VK_ARROW_UP);
        assert.notEqual(disabledItem, document.activeElement, 'Arrow up: Did not expect a disabled menu item have focus');

        menu.children[0].setAttribute('disabled', '');
        dispatchKeyDownEvent(item, VK_HOME);
        assert.notEqual(menu.children[0], document.activeElement, 'Home key: Did not expect a disabled menu item have focus');

        menu.children[menu.children.length-1].setAttribute('disabled', '');
        dispatchKeyDownEvent(item, VK_END);
        assert.notEqual(menu.children[menu.children.length-1], document.activeElement, 'End key: Did not expect a disabled menu item have focus');

        // Only one menu item is enabled
        item = menu.children[1];
        item.focus();
        dispatchKeyDownEvent(item, VK_ARROW_DOWN);
        assert.equal(item, document.activeElement, 'Arrow down: Expected second menu item to have focus');

        // Only one menu item is enabled
        item.focus();
        dispatchKeyDownEvent(item, VK_ARROW_UP);
        assert.equal(item, document.activeElement, 'Arrow up: Expected second menu item to have focus');
      }
      finally {
        removeChildElements(container);
      }
    });

    it('should not focus a menu separator', () => {
      const container = document.querySelector('#mount');
      try {
        container.insertAdjacentHTML('beforeend', menu_button_with_disabled_item_fixture);
        button = container.querySelector(`.${MENU_BUTTON}`);
        menu = container.querySelector(`.${MENU_BUTTON_MENU}`);
        componentHandler.upgradeElement(button, 'MaterialExtMenuButton');

        button.MaterialExtMenuButton.openMenu();
        const separatorItem = menu.children[2];

        let item = menu.children[1];
        item.focus();
        dispatchKeyDownEvent(item, VK_ARROW_DOWN);
        assert.notEqual(separatorItem, document.activeElement, 'Arrow down: Did not expect a menu separator item have focus');

        item = menu.children[4];
        item.focus();
        dispatchKeyDownEvent(item, VK_ARROW_UP);
        assert.notEqual(separatorItem, document.activeElement, 'Arrow up: Did not expect a menu separator item have focus');
      }
      finally {
        removeChildElements(container);
      }
    });

  });

  function dispatchKeyDownEvent(target, keyCode, shiftKey=false) {
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        keyCode: keyCode,
        shiftKey: shiftKey
      })
    );
  }

  function dispatchMouseEvent(target, name) {

    target.dispatchEvent(
      new MouseEvent(name, {
        bubbles: true,
        cancelable: true,
        view: window
      })
    );
  }

  function dispatchTouchEvent(target, name) {
    target.dispatchEvent(
      new MouseEvent(name, {
        bubbles: true,
        cancelable: true,
        view: window
      })
    );
  }

});
