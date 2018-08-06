import userAgents from './user-agents.json';


// Only compute the normalized tiers once for efficiency.
let normalizedTiers;
const getNormalizedTiers = () => {
  if (normalizedTiers) {
    return normalizedTiers;
  }
  const numberOfUserAgents = userAgents.length;
  const marketShares = userAgents.map(userAgent => userAgent.marketShare);
  const totalMarketShare = marketShares.reduce((total, marketShare) => total + marketShare);
  normalizedTiers = [];
  marketShares.forEach((marketShare, index) => {
    const runningSum = index > 0 ? normalizedTiers[index - 1] : 0;
    normalizedTiers.push((marketShare / totalMarketShare) + runningSum);
  });
  // Accounts for rounding errors, so that the range is always [0, 1].
  normalizedTiers[normalizedTiers.length - 1] = 1;
  return normalizedTiers;
};


const random = () => {
  const normalizedTiers = getNormalizedTiers();
  const randomNumber = Math.random();
  // TODO: We should probably at least do bisection here.
  let index;
  for (index = 0; index < userAgents.length; index += 1) {
    if (normalizedTiers[index] >= randomNumber) {
      break;
    }
  }
  return userAgents[index].userAgent;
};


// eslint-disable-next-line import/prefer-default-export
export { random };
