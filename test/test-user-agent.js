import assert from 'assert';

import UserAgent from '../src/user-agent';


// The randomization tests will be repeated once for each element in the range.
// We should add a more sophisticated RNG with seeding support for additional testing.
const range = Array(1000).fill();


describe('UserAgent', () => {
  describe('filtering', () => {
    it('support object properties', () => {
      const userAgent = new UserAgent({ deviceCategory: 'tablet' });
      range.forEach(() => {
        assert(userAgent().deviceCategory === 'tablet');
      });
    });

    it('support nested object properties', () => {
      const userAgent = new UserAgent({ connection: { effectiveType: '4g' }});
      range.forEach(() => {
        assert(userAgent().connection.effectiveType === '4g');
      });
    });

    it('support multiple object properties', () => {
      const userAgent = new UserAgent({ deviceCategory: 'mobile', pluginsLength: 0 });
      range.forEach(() => {
        const { deviceCategory, pluginsLength } = userAgent();
        assert(deviceCategory === 'mobile');
        assert(pluginsLength === 0);
      });
    });

    it('support top-level regular expressions', () => {
      const userAgent = new UserAgent(/Safari/);
      range.forEach(() => {
        assert(/Safari/.test(userAgent()));
      });
    });

    it('support object property regular expressions', () => {
      const userAgent = new UserAgent({ userAgent: /Safari/ });
      range.forEach(() => {
        assert(/Safari/.test(userAgent()));
      });
    });

    it('support top-level arrays', () => {
      const userAgent = new UserAgent([/Android/, /Linux/]);
      range.forEach(() => {
        const randomUserAgent = userAgent();
        assert(/Android/.test(randomUserAgent) && /Linux/.test(randomUserAgent));
      });
    });

    it('support object property arrays', () => {
      const userAgent = new UserAgent({ deviceCategory: [/(tablet|mobile)/, 'mobile'] });
      range.forEach(() => {
        const { deviceCategory } = userAgent();
        assert(deviceCategory === 'mobile');
      });
    });
  });

  describe('constructor', () => {
    it('throw an error when no filters match', () => {
      let storedError;
      try {
        new UserAgent({ deviceCategory: 'fake-no-matches' });
      } catch (error) {
        storedError = error;
      }
      assert(storedError);
    });
  });

  describe('static random()', () => {
    it('return null when no filters match', () => {
      const userAgent = UserAgent.random({ deviceCategory: 'fake-no-matches' });
      assert(userAgent === null);
    });

    it('return a valid user agent when a filter matches', () => {
      const userAgent = UserAgent.random({ userAgent: /Chrome/ });
      assert(userAgent.toString().includes('Chrome'));
      assert(/Chrome/.test(userAgent));
    });
  });

  describe('call handler', () => {
    it('produce new user agents that pass the same filters', () => {
      const userAgent = UserAgent.random({ userAgent: /Chrome/ });
      range.forEach(() => {
        assert(/Chrome/.test(userAgent()));
      });
    });
  });

  describe('top()', () => {
    it('return the requested number of entries', () => {
      const userAgent = new UserAgent();
      const top10 = userAgent.top(10);
      assert(top10.length === 10);
    });

    it('return entries sorted by descending weight', () => {
      const userAgent = new UserAgent();
      const top100 = userAgent.top(100);
      for (let i = 1; i < top100.length; i++) {
        assert(top100[i - 1].weight >= top100[i].weight);
      }
    });

    it('respect filters', () => {
      const userAgent = new UserAgent({ deviceCategory: 'mobile' });
      const top10 = userAgent.top(10);
      top10.forEach((entry) => {
        assert(entry.deviceCategory === 'mobile');
      });
    });

    it('return fewer entries when count exceeds dataset size', () => {
      const userAgent = new UserAgent({ deviceCategory: 'tablet' });
      const total = userAgent.cumulativeWeightIndexPairs.length;
      const topAll = userAgent.top(total + 100);
      assert(topAll.length === total);
    });

    it('return cloned data objects', () => {
      const userAgent = new UserAgent();
      const top1a = userAgent.top(1);
      const top1b = userAgent.top(1);
      assert(top1a[0] !== top1b[0]);
      assert(top1a[0].userAgent === top1b[0].userAgent);
    });
  });

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
