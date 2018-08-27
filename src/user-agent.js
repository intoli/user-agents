import userAgents from './user-agents.json';


// Normalizes the total weight to 1 and constructs a cumulative distribution.
const makeCumulativeWeightIndexPairs = (weightIndexPairs) => {
  const totalWeight = weightIndexPairs.reduce((sum, [weight]) => sum + weight, 0);
  let sum = 0;
  return weightIndexPairs.map(([weight, index]) => {
    sum += weight / totalWeight;
    return [sum, index];
  });
};

// Precompute these so that we can quickly generate unfiltered user agents.
const defaultWeightIndexPairs = userAgents.map(({ weight }, index) => [weight, index]);
const defaultCumulativeWeightIndexPairs = makeCumulativeWeightIndexPairs(defaultWeightIndexPairs);


export default class UserAgent extends Function {
  constructor(filters) {
    super();
    this.filter(filters);
    if (this.cumulativeWeightIndexPairs.length === 0) {
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
      this.cumulativeWeightIndexPairs = defaultCumulativeWeightIndexPairs;
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

    // Construct normalized cumulative weight index pairs given the filters.
    const weightIndexPairs = [];
    userAgents.forEach((rawUserAgent, index) => {
      if (filter(rawUserAgent)) {
        weightIndexPairs.push([rawUserAgent.weight, index]);
      }
    });
    this.cumulativeWeightIndexPairs = makeCumulativeWeightIndexPairs(weightIndexPairs);
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
