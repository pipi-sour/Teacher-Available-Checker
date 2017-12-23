
const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;

import { jsonStringToObject} from '../../src/utils/json-utils';

describe('json-utils', () => {

  describe('#jsonStringToObject', () => {

    it('converts a json string with double quotes', () => {
      const s = '{ "a": true, "b": "b is a string", "c": 10 }';
      const { a, b, c } = jsonStringToObject(s);
      expect(a).to.be.true;
      expect(b).to.equal('b is a string');
      expect(c).to.equal(10);
    });

    it('converts a json string with single quotes', () => {
      const s = "{ 'a': true, 'b': 'b is a string', 'c': 10 }"; //eslint-disable-line
      const o = jsonStringToObject(s);
      expect(o.a).to.be.true;
      expect(o.b).to.equal('b is a string');
      expect(o.c).to.equal(10);
    });

    it('throws an error if json string to convert is malformed', () => {
      const s = '{ "a": true, b: "b is malformed", "c": 10 }';
      expect(() => {
        jsonStringToObject(s);
      }).to.throw(Error);
    });

    it('preserves values in source object', () => {
      const source = {foo: 'foo'};
      const s = '{ "a": true, "b": "b is a string", "c": 10 }';
      const { a, b, c, foo } = jsonStringToObject(s, source);
      expect(a).to.be.true;
      expect(b).to.equal('b is a string');
      expect(c).to.equal(10);
      expect(foo).to.equal('foo');
    });
  });

});


