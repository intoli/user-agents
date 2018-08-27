import assert from 'assert';

import UserAgent from '../src/user-agent';


describe('UserAgent', () => {
  describe('cumulativeWeightIndexPairs', () => {
    it('have a length greater than 100', () => {
      const userAgent = new UserAgent();
      assert(userAgent.cumulativeWeightIndexPairs.length > 100);
    });

    it('have a shorter length when a filter is applied', () => {
      const userAgent = new UserAgent();
      const filteredUserAgent = new UserAgent({ deviceCategory: 'mobile' });
      assert(userAgent.cumulativeWeightIndexPairs.length > filteredUserAgent.cumulativeWeightIndexPairs.length);
    });
  });
});
