import untypedUserAgents from './user-agents.json' with { type: 'json' };

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
  language?: string | null;
  oscpu?: string | null;
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
    } catch {
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

// WeakSet tracking all UserAgent instances for `instanceof` support through proxies.
const userAgentInstances = new WeakSet<object>();

export class UserAgent {
  static [Symbol.hasInstance](instance: unknown): boolean {
    return instance instanceof Object && userAgentInstances.has(instance as object);
  }

  static random = (filters: Filter) => {
    try {
      return new UserAgent(filters);
    } catch {
      return null;
    }
  };

  // Static version that creates a temporary instance with the given filters and returns the top entries.
  static top = (count?: number, filters?: Filter): UserAgentData[] => {
    try {
      return new UserAgent(filters).top(count);
    } catch {
      return [];
    }
  };

  readonly data!: UserAgentData;

  constructor(filters?: Filter) {
    setCumulativeWeightIndexPairs(this, constructCumulativeWeightIndexPairsFromFilters(filters));
    if (this.cumulativeWeightIndexPairs.length === 0) {
      throw new Error('No user agents matched your filters.');
    }

    this.randomize();

    // Use a plain function as the proxy target so the `apply` trap works without
    // extending `Function`, which requires `eval` and violates CSP in browser extensions.
    // All property access is forwarded to the real UserAgent instance via the traps.
    const target = () => {};
    const proxy = new Proxy(target as unknown as this, {
      apply: () => this.random(),
      get: (_target, property) => {
        if (
          this.data &&
          typeof property === 'string' &&
          Object.prototype.hasOwnProperty.call(this.data, property) &&
          Object.prototype.propertyIsEnumerable.call(this.data, property)
        ) {
          const value = this.data[property as keyof UserAgentData];
          if (value !== undefined) {
            return value;
          }
        }

        return Reflect.get(this, property);
      },
      set: (_target, property, value) => Reflect.set(this, property, value),
      defineProperty: (_target, property, descriptor) =>
        Reflect.defineProperty(this, property, descriptor),
      getOwnPropertyDescriptor: (_target, property) =>
        Reflect.getOwnPropertyDescriptor(this, property),
      has: (_target, property) => Reflect.has(this, property),
      deleteProperty: (_target, property) => Reflect.deleteProperty(this, property),
      ownKeys: () => Reflect.ownKeys(this),
      getPrototypeOf: () => UserAgent.prototype,
    });
    userAgentInstances.add(proxy);
    return proxy;
  }

  [Symbol.toPrimitive] = (): string => this.data.userAgent;

  toString = (): string => this.data.userAgent;

  random = (): UserAgent => {
    const userAgent = new UserAgent();
    setCumulativeWeightIndexPairs(userAgent, this.cumulativeWeightIndexPairs);
    userAgent.randomize();
    return userAgent;
  };

  top = (count?: number): UserAgentData[] => {
    // Recover individual weights from the cumulative distribution and sort by descending weight.
    const pairs = this.cumulativeWeightIndexPairs;
    const entries = pairs.map(([cumWeight, index], i) => ({
      weight: i > 0 ? cumWeight - pairs[i - 1][0] : cumWeight,
      index,
    }));
    entries.sort((a, b) => b.weight - a.weight);
    const n = count != null ? Math.min(count, entries.length) : entries.length;
    return entries.slice(0, n).map(({ index }) => structuredClone(userAgents[index]));
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

    (this as { data: UserAgentData }).data = structuredClone(userAgents[index]);
  };
}
