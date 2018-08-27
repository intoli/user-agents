import assert from 'assert';

import UserAgent from '../src/user-agent';


describe('UserAgent', () => {
  describe('weightIndexPairs', () => {
    it('have a length greater than 100', () => {
      const userAgent = new UserAgent();
      assert(userAgent.weightIndexPairs.length > 100);
    });
  });
});
