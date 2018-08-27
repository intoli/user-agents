import userAgents from './user-agents.json';


const defaultWeightIndexPairs = userAgents.map(({ weight }, index) => [weight, index]);


export default class UserAgent extends Function {
  constructor(filters) {
    super();
    this.filter(filters);
    if (this.weightIndexPairs.length === 0) {
      return null;
    }

    this.currentUserAgentProperties = new Set();
    this.randomize();
  }

  static random = (filters) => (
    new UserAgent(filters)
  );

  // This is an internal method, you probably don't want to every call this.
  filter = (filters) => {
    if (!filters) {
      this.userAgents = userAgents;
      this.weightIndexPairs = defaultWeightIndexPairs;
      return;
    }

    // Turn the various filter formats into a single filter function that acts on raw user agents.
    let filter;
    if (typeof filters === 'function') {
      filter = filters;
    } else if (typeof filters === 'object') {
      // TODO: Handle nested properties.
      filter = (rawUserAgent) => (
        Object.entries(filters).every(([key, valueFilter]) => {
          const value = rawUserAgent[key];
          if (typeof valueFilter === 'function') {
            return valueFilter(value);
          }
          if (valueFilter instanceof RegExp) {
            return valueFilter.test(value);
          }
          return valueFilter === value;
        })
      );
    }

    // Construct normalized weight index pairs given the filters.
    this.weightIndexPairs = [];
    let totalWeight = 0;
    userAgents.forEach((rawUserAgent, index) => {
      if (filter(rawUserAgent)) {
        this.weightIndexPairs.push([rawUserAgent.weight, index]);
        totalWeight += rawUserAgent.weight;
      }
    });
    this.weightIndexPairs = this.weightIndexPairs.map(([weight, index]) => [weight / totalWeight, index]);
  };

  random = () => {
    const userAgent = new UserAgent();
    userAgent.userAgents = this.userAgents;
    userAgent.randomize();
  };

  randomize = () => {
    // TODO: Populate the random properties.
  }
};
