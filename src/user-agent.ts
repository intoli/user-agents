import cloneDeep from 'lodash.clonedeep';

import untypedUserAgents from './user-agents.json' assert { type: 'json' };

const userAgents: UserAgentData[] = untypedUserAgents as UserAgentData[];

type NestedValueOf<T> = T extends object ? T[keyof T] | NestedValueOf<T[keyof T]> : T;

export type Filter<T extends UserAgentData | NestedValueOf<UserAgentData> = UserAgentData> =
  | ((parentObject: T) => boolean)
  | RegExp
  | Array<Filter<T>>
  | { [key: string]: Filter<T> }
  | string;

export interface UserAgentData {
  appName: 'Netscape';
  connection: {
    downlink: number;
    effectiveType: '3g' | '4g';
    rtt: number;
    downlinkMax?: number | null;
    type?: 'cellular' | 'wifi';
  };
  platform:
    | 'iPad'
    | 'iPhone'
    | 'Linux aarch64'
    | 'Linux armv81'
    | 'Linux armv8l'
    | 'Linux x86_64'
    | 'MacIntel'
    | 'Win32';
  pluginsLength: number;
  screenHeight: number;
  screenWidth: number;
  userAgent: string;
  vendor: 'Apple Computer, Inc.' | 'Google Inc.' | '';
  weight: number;
}

declare module './user-agent' {
  export interface UserAgent extends Readonly<UserAgentData> {
    readonly cumulativeWeightIndexPairs: Array<[number, number]>;
    readonly data: UserAgentData;
    (): UserAgent;
  }
}

// Normalizes the total weight to 1 and constructs a cumulative distribution.
const makeCumulativeWeightIndexPairs = (
  weightIndexPairs: Array<[number, number]>,
): Array<[number, number]> => {
  const totalWeight = weightIndexPairs.reduce((sum, [weight]) => sum + weight, 0);
  let sum = 0;
  return weightIndexPairs.map(([weight, index]) => {
    sum += weight / totalWeight;
    return [sum, index];
  });
};

// Precompute these so that we can quickly generate unfiltered user agents.
const defaultWeightIndexPairs: Array<[number, number]> = userAgents.map(({ weight }, index) => [
  weight,
  index,
]);
const defaultCumulativeWeightIndexPairs = makeCumulativeWeightIndexPairs(defaultWeightIndexPairs);

// Turn the various filter formats into a single filter function that acts on raw user agents.
const constructFilter = <T extends UserAgentData | NestedValueOf<UserAgentData>>(
  filters: Filter<T>,
  accessor: (parentObject: T) => T | NestedValueOf<T> = (parentObject: T): T => parentObject,
): ((profile: T) => boolean) => {
  // WARNING: This type and a lot of the types in here are wrong, but I can't get TypeScript to
  // resolve things correctly so this will have to do for now.
  let childFilters: Array<(parentObject: T) => boolean>;
  if (typeof filters === 'function') {
    childFilters = [filters];
  } else if (filters instanceof RegExp) {
    childFilters = [
      (value: T | NestedValueOf<T>) =>
        typeof value === 'object' && value && 'userAgent' in value && value.userAgent
          ? filters.test(value.userAgent)
          : filters.test(value as string),
    ];
  } else if (filters instanceof Array) {
    childFilters = filters.map((childFilter) => constructFilter(childFilter));
  } else if (typeof filters === 'object') {
    childFilters = Object.entries(filters).map(([key, valueFilter]) =>
      constructFilter(
        valueFilter as Filter<T>,
        (parentObject: T): T | NestedValueOf<T> =>
          (parentObject as unknown as { [key: string]: NestedValueOf<T> })[key] as NestedValueOf<T>,
      ),
    );
  } else {
    childFilters = [
      (value: T | NestedValueOf<T>) =>
        typeof value === 'object' && value && 'userAgent' in value && value.userAgent
          ? filters === value.userAgent
          : filters === value,
    ];
  }

  return (parentObject: T) => {
    try {
      const value = accessor(parentObject);
      return childFilters.every((childFilter) => childFilter(value as T));
    } catch (error) {
      // This happens when a user-agent lacks a nested property.
      return false;
    }
  };
};

// Construct normalized cumulative weight index pairs given the filters.
const constructCumulativeWeightIndexPairsFromFilters = (
  filters?: Filter<UserAgentData>,
): Array<[number, number]> => {
  if (!filters) {
    return defaultCumulativeWeightIndexPairs;
  }

  const filter = constructFilter(filters);

  const weightIndexPairs: Array<[number, number]> = [];
  userAgents.forEach((rawUserAgent, index) => {
    if (filter(rawUserAgent)) {
      weightIndexPairs.push([rawUserAgent.weight, index]);
    }
  });
  return makeCumulativeWeightIndexPairs(weightIndexPairs);
};

const setCumulativeWeightIndexPairs = (
  userAgent: UserAgent,
  cumulativeWeightIndexPairs: Array<[number, number]>,
) => {
  Object.defineProperty(userAgent, 'cumulativeWeightIndexPairs', {
    configurable: true,
    enumerable: false,
    writable: false,
    value: cumulativeWeightIndexPairs,
  });
};

export class UserAgent extends Function {
  constructor(filters?: Filter) {
    super();
    setCumulativeWeightIndexPairs(this, constructCumulativeWeightIndexPairsFromFilters(filters));
    if (this.cumulativeWeightIndexPairs.length === 0) {
      throw new Error('No user agents matched your filters.');
    }

    this.randomize();

    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, {
      apply: () => this.random(),
      get: (target, property, receiver) => {
        const dataCandidate =
          target.data &&
          typeof property === 'string' &&
          Object.prototype.hasOwnProperty.call(target.data, property) &&
          Object.prototype.propertyIsEnumerable.call(target.data, property);
        if (dataCandidate) {
          const value = target.data[property as keyof UserAgentData];
          if (value !== undefined) {
            return value;
          }
        }

        return Reflect.get(target, property, receiver);
      },
    });
  }

  static random = (filters: Filter) => {
    try {
      return new UserAgent(filters);
    } catch (error) {
      return null;
    }
  };

  //
  // Standard Object Methods
  //

  [Symbol.toPrimitive] = (): string => this.data.userAgent;

  toString = (): string => this.data.userAgent;

  random = (): UserAgent => {
    const userAgent = new UserAgent();
    setCumulativeWeightIndexPairs(userAgent, this.cumulativeWeightIndexPairs);
    userAgent.randomize();
    return userAgent;
  };

  randomize = (): void => {
    // Find a random raw random user agent.
    const randomNumber = Math.random();
    const [, index] =
      this.cumulativeWeightIndexPairs.find(
        ([cumulativeWeight]) => cumulativeWeight > randomNumber,
      ) ?? [];
    if (index == null) {
      throw new Error('Error finding a random user agent.');
    }
    const rawUserAgent = userAgents[index];

    (this as { data: UserAgentData }).data = cloneDeep(rawUserAgent);
  };
}
