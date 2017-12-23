import { expect } from 'chai';

import { easeInOutQuad, inOutQuintic } from '../../src/utils/easing';

describe('easing', () => {
  const start = 0;
  const distance = 1000;
  const duration = 500;

  describe('#inOutQuintic', () => {
    it('should advance a fraction of the given distance', () => {
      let t = 100;
      const a = inOutQuintic(t, start, distance, duration);
      expect(a).to.not.equal(0);

      t = 400;
      const b = inOutQuintic(t, start, distance, duration);
      expect(b).to.not.equal(a);
    });
  });

  describe('#easeInOutQuad', () => {
    it('should advance a fraction of the given distance', () => {
      let t = 100;
      const a = easeInOutQuad(t, start, distance, duration);
      expect(a).to.not.equal(0);

      t = 900;
      const b = easeInOutQuad(t, start, distance, duration);
      expect(b).to.not.equal(a);
    });
  });
});
