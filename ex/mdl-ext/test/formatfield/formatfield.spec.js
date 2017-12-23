/* eslint-env mocha */
import { before, beforeEach, after, afterEach, describe, it } from 'mocha';
import { assert, expect } from 'chai';
import sinon from 'sinon';
import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import {patchJsDom} from '../testutils/patch-jsdom';
import {removeChildElements} from '../../src/utils/dom-utils';
import {shouldBehaveLikeAMdlComponent} from '../testutils/shared-component-behaviours';

const JS_FORMAT_FIELD = 'mdlext-js-formatfield';
const FORMAT_FIELD_COMPONENT = 'MaterialExtFormatfield';

const fixture_textfield = `
<div class="mdl-textfield mdl-js-textfield mdlext-js-formatfield">
  <input class="mdl-textfield__input" type="text" pattern="[0-9]*" id="phone">
  <label class="mdl-textfield__label" for="phone">Phone</label>
  <span class="mdl-textfield__error">Digits only</span>
</div>`;

const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Collapsible Fixture</title>
</head>
<body>
<main>
  <div id="default-fixture">
    ${fixture_textfield}
  </div>
  <div id="mount">
  </div>
</main>
</body>
</html>`;


describe('MaterialExtFormatfield', () => {

  let mount;

  before ( () => {
    patchJsDom(fixture);

    // Must load MDL after jsdom, see: https://github.com/mochajs/mocha/issues/1722
    requireUncached( 'material-design-lite/material');
    global.componentHandler = window.componentHandler;
    expect(componentHandler, 'Expected global MDL component handler').to.be.an.object;

    requireUncached('../../src/formatfield/formatfield');
    expect(window.MaterialExtFormatfield, 'Expected MaterialExtFormatfield not to be null').to.not.null;
    global.MaterialExtFormatfield = window.MaterialExtFormatfield;
  });

  after ( () => {
    jsdomify.destroy();
  });

  beforeEach( () => {
    mount = document.querySelector('#mount');
  });

  afterEach( () => {
    const mdl = mount.querySelectorAll('.is-upgraded');
    componentHandler.downgradeElements(mdl);
    removeChildElements(mount);
  });

  describe('General behaviour', () => {
    shouldBehaveLikeAMdlComponent({
      componentName: FORMAT_FIELD_COMPONENT,
      componentCssClass: JS_FORMAT_FIELD,
      newComponenrMountNodeSelector: '#mount',
      newComponentHtml: fixture_textfield
    });

    it('should have public methods available via widget', () => {
      const {component} = createSingleLineTextfield();
      mount.appendChild(component);
      componentHandler.upgradeElement(component);
      const methods = [
        'getOptions',
        'getUnformattedValue',
      ];
      methods.forEach( fn => {
        expect(component.MaterialExtFormatfield[fn]).to.be.a('function');
      });
    });
  });

  describe('Options', () => {
    it('should have default options', () => {
      const {component} = createSingleLineTextfield();
      mount.appendChild(component);
      componentHandler.upgradeElement(component);
      const options = component.MaterialExtFormatfield.getOptions();
      expect(options, 'Expected default options').to.be.defined;
      expect(options.locales, 'Expected default options.locales').to.be.defined;
      expect(options.groupSeparator, 'Expected default options.groupSeparator').to.be.defined;
      expect(options.decimalSeparator, 'Expected default options.decimalSeparator').to.be.defined;
    });

    it('should set options via data attribute', () => {
      const {component} = createSingleLineTextfield('{"locales": "nb-NO", "groupSeparator": ";", "decimalSeparator": "," }');
      mount.appendChild(component);
      expect(() => {
        componentHandler.upgradeElement(component);
      }).to.not.throw(Error);

      const options = component.MaterialExtFormatfield.getOptions();
      expect(options.locales).to.equal('nb-NO');
      expect(options.groupSeparator).to.equal(';');
      expect(options.decimalSeparator).to.equal(',');
    });

    it('should throw an error if data attribute is malformed', () => {
      const {component} = createSingleLineTextfield('{"locales": ILLEGAL, "groupSeparator": VALUE, "decimalSeparator": "," }');
      mount.appendChild(component);
      expect(() => {
        componentHandler.upgradeElement(component);
      }).to.throw(Error);
    });

    it('should throw an error if options.groupSeparator === options.decimalSeparator', () => {
      const {component} = createSingleLineTextfield('{"groupSeparator": ".", "decimalSeparator": "." }');
      mount.appendChild(component);
      expect(() => {
        componentHandler.upgradeElement(component);
      }).to.throw(Error);
    });
  });

  describe('Format', () => {
    it('should format input value when initialized', () => {
      const {component, input} = createSingleLineTextfield(
        '{"locales": "nb-NO", "groupSeparator": " ", "decimalSeparator": "," }',
        '1234.5'
      );
      mount.appendChild(component);
      componentHandler.upgradeElement(component);
      expect(input.value).to.equal('1 234,5');
    });

    it('should not format input value if NaN', () => {
      const {component, input} = createSingleLineTextfield(
        '{"locales": "nb-NO", "groupSeparator": " ", "decimalSeparator": "," }',
        'ABC1234.5'
      );
      mount.appendChild(component);
      componentHandler.upgradeElement(component);
      expect(input.value).to.equal('ABC1234.5');
    });

    it('should return the unformatted value', () => {
      const {component, input} = createSingleLineTextfield(
        '{"locales": "nb-NO", "groupSeparator": " ", "decimalSeparator": "," }',
        '1234.5'
      );
      mount.appendChild(component);
      componentHandler.upgradeElement(component);
      expect(input.value).to.equal('1 234,5');
      expect(component.MaterialExtFormatfield.getUnformattedValue()).to.equal('1234.5');
    });
  });

  describe('Events', () => {
    it('should strip group separator from value on focus, then format value on blur', () => {
      const {component, input} = createSingleLineTextfield(
        '{"locales": "nb-NO", "groupSeparator": ",", "decimalSeparator": "." }',
        '1234567.8'
      );
      mount.appendChild(component);
      componentHandler.upgradeElement(component);

      dispatchEvent(input, 'focusin');
      expect(input.value).to.equal('1234567.8');

      dispatchEvent(input, 'focusout');
      expect(input.value).to.equal('1,234,567.8');
    });

    it('should not alter value if input is readonly', () => {
      const {component, input} = createSingleLineTextfield(
        '{"locales": "nb-NO", "groupSeparator": " ", "decimalSeparator": "," }',
        '1234.5'
      );
      mount.appendChild(component);
      input.setAttribute('readonly', '');
      componentHandler.upgradeElement(component);

      dispatchEvent(input, 'focusin');
      expect(input.value).to.equal('1 234,5');

      dispatchEvent(input, 'foxusout');
      expect(input.value).to.equal('1 234,5');
    });

    it('should not alter value if input is disabled', () => {
      const {component, input} = createSingleLineTextfield(
        '{"locales": "nb-NO", "groupSeparator": ",", "decimalSeparator": "." }',
        '1234.5'
      );
      mount.appendChild(component);
      input.setAttribute('disabled', '');
      componentHandler.upgradeElement(component);

      dispatchEvent(input, 'focusin');
      expect(input.value).to.equal('1,234.5');

      dispatchEvent(input, 'focusout');
      expect(input.value).to.equal('1,234.5');
    });

    it('should cancel text selection when input is clicked', () => {
      const {component, input} = createSingleLineTextfield(
        '{"locales": "nb-NO", "groupSeparator": ",", "decimalSeparator": "." }',
        '1234.5'
      );
      mount.appendChild(component);
      componentHandler.upgradeElement(component);

      const spy = sinon.spy(input, 'select');

      dispatchEvent(input, 'focusin');
      dispatchEvent(input, 'click');

      sinon.restore(spy);
      assert.isFalse(spy.called, 'Expected click to cancel select');
    });

    it('should call input.select() after a 200ms delay', () => {
      const {component, input} = createSingleLineTextfield(
        '{"locales": "nb-NO", "groupSeparator": ",", "decimalSeparator": "." }',
        '1234.5'
      );
      mount.appendChild(component);
      componentHandler.upgradeElement(component);

      const clock = sinon.useFakeTimers();
      const spy = sinon.spy(input, 'select');

      dispatchEvent(input, 'focusin');

      clock.tick(201);
      sinon.restore(spy);
      clock.restore();
      assert.isTrue(spy.called, 'Expected select to be called after 200ms');
    });

  });

  function dispatchEvent(target, eventName) {
    target.dispatchEvent(new Event(eventName, {
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }

  function createSingleLineTextfield(opts, value='') {
    const component = document.createElement('div');
    const input = document.createElement('input');
    const label = document.createElement('label');
    const errorMessage = document.createElement('span');
    component.className = 'mdl-textfield mdl-js-textfield mdlext-js-formatfield';
    input.className = 'mdl-textfield__input';
    input.pattern = '[0-9]';
    input.id = 'testInput';
    input.value = value;
    label.for = input.id;
    label.className = 'mdl-textfield__label';
    label.text = 'Number';
    errorMessage.className = 'mdl-textfield__error';
    errorMessage.text = 'Positive number only.';
    component.appendChild(input);
    component.appendChild(label);
    component.appendChild(errorMessage);
    if(opts) {
      component.setAttribute('data-formatfield-options', opts);
    }
    return {component: component, input: input};
  }

});
