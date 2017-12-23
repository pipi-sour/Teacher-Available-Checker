'use strict';
import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import {patchJsDom} from '../testutils/patch-jsdom';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import { shouldBehaveLikeAMdlComponent } from '../testutils/shared-component-behaviours';
import { removeChildElements } from '../../src/utils/dom-utils';

describe('MaterialExtSelectfield', () => {

  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Select Fixture</title>
</head>
<body>
<div id='mount'>
  <div class="mdlext-selectfield mdlext-js-selectfield">
    <select class="mdlext-selectfield__select" id="select-1" name="select-1" autofocus >
      <option value=""></option>
      <option value="option1">option 1</option>
      <option value="option2">option 2</option>
      <option value="option3">option 3</option>
      <option value="option4">option 4</option>
      <option value="option5">option 5</option>
    </select>
    <label class="mdlext-selectfield__label" for="select-1">Profession</label>
  </div>
  <div class="mdlext-selectfield mdlext-js-selectfield">
    <select class="mdlext-selectfield__select" id="select-2" name="select-2" disabled >
      <option value=""></option>
      <option value="option1">option 1</option>
    </select>
    <label class="mdlext-selectfield__label" for="select-1">Profession</label>
  </div>
  <div id="mount-2">
  </div>
</div>
</body>
</html>`;

  const fragment = `
<div class="mdlext-selectfield mdlext-js-selectfield" id="country">
  <select class="mdlext-selectfield__select" id="select-country" name="select-country" autofocus >
    <option value=""></option>
    <option value="option1">Norway</option>
    <option value="option2">Iceland</option>
    <option value="option3">Sweden</option>
    <option value="option4">Denmark</option>
    <option value="option5">Finalnd</option>
  </select>
  <label class="mdlext-selectfield__label" for="select-country">Country</label>
</div>`;

  const select_has_id_label_has_no_for_attribute = `
<div class="mdlext-selectfield mdlext-js-selectfield" id="country">
  <select class="mdlext-selectfield__select" id="select-country" name="select-country" autofocus >
    <option value=""></option>
    <option value="option1">Norway</option>
    <option value="option2">Iceland</option>
    <option value="option3">Sweden</option>
    <option value="option4">Denmark</option>
    <option value="option5">Finalnd</option>
  </select>
  <label class="mdlext-selectfield__label">Country</label>
</div>`;

  const select_without_id_label_without_for_attribute = `
<div class="mdlext-selectfield mdlext-js-selectfield" id="country">
  <select class="mdlext-selectfield__select" name="select-country" autofocus >
    <option value=""></option>
    <option value="option1">Norway</option>
    <option value="option2">Iceland</option>
    <option value="option3">Sweden</option>
    <option value="option4">Denmark</option>
    <option value="option5">Finalnd</option>
  </select>
  <label class="mdlext-selectfield__label">Country</label>
</div>`;

  before ( () => {
    patchJsDom(fixture);

    // Must load MDL after jsdom, see: https://github.com/mochajs/mocha/issues/1722
    requireUncached( 'material-design-lite/material');
    global.componentHandler = window.componentHandler;
    assert.isObject(componentHandler, 'No global MDL component handler');

    requireUncached( '../../src/selectfield/selectfield' );
    assert.isNotNull(window.MaterialExtSelectfield, 'Expected MaterialExtSelectfield not to be null');
    global.MaterialExtSelectfield = window.MaterialExtSelectfield;
  });

  after ( () => {
    jsdomify.destroy();
  });

  shouldBehaveLikeAMdlComponent({
    componentName: 'MaterialExtSelectfield',
    componentCssClass: 'mdlext-js-selectfield',
    newComponenrMountNodeSelector: '#mount-2',
    newComponentHtml: fragment
  });

  it('should have public methods available via widget', () => {
    const el = createSingleLineSelectfield();
    componentHandler.upgradeElement(el, 'MaterialExtSelectfield');
    const methods = [
      'checkDisabled',
      'checkValidity',
      'checkDirty',
      'checkFocus',
      'disable',
      'enable',
      'change'
    ];
    methods.forEach( fn => {
      expect(el.MaterialExtSelectfield[fn]).to.be.a('function');
    });
  });

  it('should be invalid after upgrade if invalid previously', () => {
    const el = createSingleLineSelectfield();
    el.classList.add('is-invalid');
    componentHandler.upgradeElement(el);
    expect(el.classList.contains('is-invalid')).to.equal(true);
  });

  it('trigger events', () => {
    const select = document.querySelector('#select-1');
    assert.isNotNull(select);
    expect( () => {
      spyOnEvent('change', select);
      spyOnEvent('focus', select);
      spyOnEvent('blur', select);
      spyOnEvent('reset', select);
    }).to.not.throw(Error);
  });

  it('can call public methodes', () => {
    const el = document.querySelector('.mdlext-selectfield');
    expect( () => {
      el.MaterialExtSelectfield.checkDisabled();
      el.MaterialExtSelectfield.checkValidity();
      el.MaterialExtSelectfield.checkDirty();
      el.MaterialExtSelectfield.checkFocus();
      el.MaterialExtSelectfield.disable();
      el.MaterialExtSelectfield.enable();
      el.MaterialExtSelectfield.checkFocus();
      el.MaterialExtSelectfield.change('option2');
    }).to.not.throw(Error);

/*eslint-disable */
    new MaterialExtSelectfield(null);

    const el2 = createSingleLineSelectfield();
    const select = [...el2.childNodes].find( n => n.nodeName.toLowerCase() === 'select');
    if(select !== null) {
      el2.removeChild(select);
    }
    new MaterialExtSelectfield(el2);

    const el3 = createSingleLineSelectfield();
    new MaterialExtSelectfield(el3).init();
/*eslint-enable */
    assert(true);
  });

  it('receives focus', () => {
    const element = document.querySelector('.mdlext-js-selectfield');
    assert.isNotNull(element, 'Expected handle to mdlext-js-selectfield');
    const select = element.querySelector('.mdlext-selectfield__select');
    assert.isNotNull(select, 'Expected handle to mdlext-selectfield__select');

    select.dispatchEvent(
      new Event('focus', {
        bubbles: true,
        cancelable: true,
        view: window
      })
    );
    assert.isTrue(element.classList.contains('is-focused'), 'Expected select component to have focus');
  });

  it('should not modify "id" and "for" attributes if provided in markup', () => {
    const container = document.querySelector('#mount-2');
    try {
      container.insertAdjacentHTML('beforeend', fragment);
      const element = container.querySelector('.mdlext-js-selectfield');
      assert.isNotNull(element, 'Expected handle to "mdlext-js-selectfield"');

      const select = container.querySelector('.mdlext-selectfield__select');
      assert.isNotNull(select, 'Expected handle to "mdlext-selectfield__select"');
      const id = select.id;

      const label = container.querySelector('.mdlext-selectfield__label');
      assert.isNotNull(label, 'Expected handle to "mdlext-selectfield__select"');
      const labelFor = label.getAttribute('for');

      componentHandler.upgradeElement(element, 'MaterialExtSelectfield');

      assert.equal(select.id, id, 'Expected select "id" attribute value to not be modified');
      assert.equal(label.getAttribute('for'), labelFor, 'Expected label "for" attribute value not to be modified');
    }
    finally {
      removeChildElements(container);
    }
  });

  it('should add label "for" attribute if not provided in markup', () => {
    const container = document.querySelector('#mount-2');
    try {
      container.insertAdjacentHTML('beforeend', select_has_id_label_has_no_for_attribute);
      const element = container.querySelector('.mdlext-js-selectfield');
      assert.isNotNull(element, 'Expected handle to "mdlext-js-selectfield"');

      const select = container.querySelector('.mdlext-selectfield__select');
      assert.isNotNull(select, 'Expected handle to "mdlext-selectfield__select"');
      const id = select.id;

      const label = container.querySelector('.mdlext-selectfield__label');
      assert.isNotNull(label, 'Expected handle to "mdlext-selectfield__select"');
      assert.isFalse(label.hasAttribute('for'), 'Expected label "for" attribute to not exist');

      componentHandler.upgradeElement(element, 'MaterialExtSelectfield');

      assert.equal(select.id, id, 'Expected select "id" attribute value to not be modified');
      assert.equal(label.getAttribute('for'), select.id, 'Expected "for" attribute value to be equal to select "id" attribute value');
    }
    finally {
      removeChildElements(container);
    }
  });

  it('should add pseudo id if id not provided in markup', () => {
    const container = document.querySelector('#mount-2');
    try {
      container.insertAdjacentHTML('beforeend', select_without_id_label_without_for_attribute);
      const element = container.querySelector('.mdlext-js-selectfield');
      assert.isNotNull(element, 'Expected handle to "mdlext-js-selectfield"');

      const select = container.querySelector('.mdlext-selectfield__select');
      assert.isNotNull(select, 'Expected handle to "mdlext-selectfield__select"');
      assert.isFalse(select.hasAttribute('id'), 'Expected select "id" attribute to not exist');

      const label = container.querySelector('.mdlext-selectfield__label');
      assert.isNotNull(label, 'Expected handle to "mdlext-selectfield__select"');
      assert.isFalse(label.hasAttribute('for'), 'Expected label "for" attribute to not exist');

      componentHandler.upgradeElement(element, 'MaterialExtSelectfield');

      assert.isTrue(select.hasAttribute('id'), 'Expected select "id" attribute to exist after upgrade');
      assert.isTrue(label.hasAttribute('for'), 'Expected label "for" attribute to exist after upgrade');

      assert.equal(label.getAttribute('for'), select.id, 'Expected label "for" attribute value to be equal to select "id" attribute value');
    }
    finally {
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

  function createSingleLineSelectfield() {
    const container = document.createElement('div');
    const select = document.createElement('select');
    const label = document.createElement('label');
    const errorMessage = document.createElement('span');
    container.className = 'mdlext-selectfield mdlext-js-selectfield';
    select.className = 'mdlext-selectfield__select';
    select.id = 'select-testInput';
    label.for = select.id;
    label.className = 'mdlext-selectfield__label';
    label.text = 'Country';
    errorMessage.className = 'mdlext-selectfield__error';
    errorMessage.text = 'Nothing selected.';

    let opt;
    for (let i = 0; i < 5; i++) {
      opt = document.createElement('option');
      opt.value = `Option #${i}`;
      opt.innerHTML = opt.value;
      select.appendChild(opt);
    }
    container.appendChild(select);
    container.appendChild(label);
    container.appendChild(errorMessage);
    return container;
  }

});
