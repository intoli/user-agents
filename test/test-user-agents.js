import assert from 'assert';

import userAgents from '../src';


describe('User Agents', () => {
  describe('list', () => {
    it('be an array', () => {
      assert(userAgents.list instanceof Array);
    });

    it('have a length greater than ten', () => {
      assert(userAgents.list.length > 10);
    });
  });

  describe('random', () => {
    it('generate a string with length longer than ten', () => {
      assert(userAgents.random().length > 10);
    });
  });
});
