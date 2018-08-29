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


const constructCumulativeWeightIndexPairsFromFilters = (filters) => {
  if (!filters) {
    return defaultCumulativeWeightIndexPairs;
  }

  // Turn the various filter formats into a single filter function that acts on raw user agents.
  let filter;
  if (typeof filters === 'function') {
    filter = filters;
  } else if (typeof filters === 'object') {
    // TODO: Handle nested properties.
    filter = rawUserAgent => (
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
  return makeCumulativeWeightIndexPairs(weightIndexPairs);
};


const setCumulativeWeightIndexPairs = (userAgent, cumulativeWeightIndexPairs) => {
  Object.defineProperty(userAgent, 'cumulativeWeightIndexPairs', {
    configurable: true,
    enumerable: false,
    writable: false,
    value: cumulativeWeightIndexPairs,
  });
};


export default class UserAgent extends Function {
  constructor(filters) {
    super();
    setCumulativeWeightIndexPairs(this, constructCumulativeWeightIndexPairsFromFilters(filters));
    if (this.cumulativeWeightIndexPairs.length === 0) {
      throw new Error('No user agents matched your filters.');
    }

    this.currentUserAgentProperties = new Set();
    this.randomize();

    return new Proxy(this, {
      apply: () => this.random(),
    });
  }

  static random = (filters) => {
    try {
      return new UserAgent(filters);
    } catch (error) {
      return null;
    }
  };

  //
  // Standard Object Methods
  //

  [Symbol.toPrimitive] = () => (
    this.userAgent
  );

  toString = () => (
    this.userAgent
  );

  random = () => {
    const userAgent = new UserAgent();
    setCumulativeWeightIndexPairs(userAgent, this.cumulativeWeightIndexPairs);
    userAgent.randomize();
    return userAgent;
  };

  randomize = () => {
    // Find a random raw random user agent.
    const randomNumber = Math.random();
    const [, index] = this.cumulativeWeightIndexPairs
      .find(([cumulativeWeight]) => cumulativeWeight > randomNumber);
    const rawUserAgent = userAgents[index];

    // Strip off any existing properties from previous randomizations.
    this.currentUserAgentProperties.forEach((property) => { delete this[property]; });
    this.currentUserAgentProperties.clear();

    // Attach the new properties.
    Object.entries(rawUserAgent).forEach(([key, value]) => {
      this.currentUserAgentProperties.add(key);
      this[key] = value;
    });
  }
}
