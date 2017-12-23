'use strict';

import { removeChildElements } from '../../src/utils/dom-utils';

const it = require('mocha').it;
const assert = require('chai').assert;
const expect = require('chai').expect;
//const sinon = require('sinon');

const shouldBehaveLikeAMdlComponent = args => {

  const { componentName, componentCssClass, newComponenrMountNodeSelector, newComponentHtml } = args;

  it('is globally available', () => {
    assert.isFunction(window[componentName], `Expected "${componentName}" to be globally available`);
  });

  it('upgrades successfully', () => {
    const element = document.querySelector(`.${componentCssClass}`);
    assert.isNotNull(element, `Expected handle to "${componentCssClass}"`);
    assert.isTrue(element.classList.contains('is-upgraded'), `Expected "${componentCssClass}" to have class "is-upgraded"`);

    const dataUpgraded = element.getAttribute('data-upgraded');
    assert.isNotNull(dataUpgraded, `Expected "${componentCssClass}" to have attribute "data-upgraded"`);
    assert.isAtLeast(dataUpgraded.indexOf(componentName), 0, `Expected attribute "data-upgraded" to contain "${componentName}"`);
  });

  it('should be a widget', () => {
    const element = document.querySelector(`.${componentCssClass}`);
    assert.isNotNull(element, `Expected handle to "${componentCssClass}"`);
    expect(element[componentName]).to.be.a('object', `Expected "${componentName}" to be a widget`);
  });

  it('upgrades successfully when a new component is appended to the DOM', () => {
    if(newComponenrMountNodeSelector !== undefined) {
      const container = document.querySelector(newComponenrMountNodeSelector);
      try {
        container.insertAdjacentHTML('beforeend', newComponentHtml);
        const element = container.querySelector(`.${componentCssClass}`);
        assert.isNotNull(element, `Expected handle to "${componentCssClass}"`);

        assert.isFalse(element.classList.contains('is-upgraded'), 'Expected class "is-upgraded" to not exist before upgrade');
        componentHandler.upgradeElement(element, componentName);
        assert.isTrue(element.classList.contains('is-upgraded'), `Expected "${componentCssClass}" to upgrade (should contain class "is-upgraded")`);

        const dataUpgraded = element.getAttribute('data-upgraded');
        assert.isNotNull(dataUpgraded, 'Expected attribute "data-upgraded" to exist');
        assert.isAtLeast(dataUpgraded.indexOf(componentName), 0, `Expected attriobute "data-upgraded" attribute to contain "${componentName}"`);
      }
      finally {
        removeChildElements(container);
      }
    }
  });

  it('downgrades successfully', () => {
    if(newComponenrMountNodeSelector !== undefined) {
      const container = document.querySelector(newComponenrMountNodeSelector);
      try {
        container.insertAdjacentHTML('beforeend', newComponentHtml);
        const element = container.querySelector(`.${componentCssClass}`);

        componentHandler.upgradeElement(element, componentName);
        assert.isTrue(element.classList.contains('is-upgraded'), `Expected "${componentCssClass}" to upgrade before downgrade`);

        componentHandler.downgradeElements(element);
        expect(element.getAttribute('data-upgraded')).to.not.include(componentName, `Expected "${componentName}" to downgrade`);
      }
      finally {
        removeChildElements(container);
      }
    }
  });

};


export { shouldBehaveLikeAMdlComponent };
