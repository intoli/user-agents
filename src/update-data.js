/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import { gzipSync } from 'zlib';

import jsonStableStringify from 'json-stable-stringify';
import gaApi from 'ga-api';
import moment from 'moment';
import random from 'random';


// Custom dimensions, see: https://intoli.com/blog/user-agents/
const customDimensionMap = {
  'ga:dimension1': 'appName',
  'ga:dimension2': 'connection',
  'ga:dimension3': 'cpuClass',
  'ga:dimension5': 'oscpu',
  'ga:dimension6': 'platform',
  'ga:dimension7': 'pluginsLength',
  'ga:dimension8': 'vendor',
  'ga:dimension9': 'userAgent',
};
// And the special timestamp session ID that we'll use for joining data.
const sessionIdDimension = 'ga:dimension10';

// Standard dimensions used by Google Analytics.
const standardDimensionMap = {
  'ga:browserSize': 'browserSize',
  'ga:deviceCategory': 'deviceCategory',
  'ga:screenResolution': 'screenResolution',
};


// These primarily help map missing data to `null`/`undefined` properly.
const parseCustomDimension = (value, json = false) => {
  if (value === 'null') {
    return null;
  }
  if (value === 'undefined') {
    return undefined;
  }
  if (json && value) {
    try {
      return parseCustomDimension(JSON.parse(value));
    } catch (error) {
      console.error(`Error parsing "${value}" as JSON.`, error);
      return null;
    }
  }
  if (typeof value === 'object' && value !== null) {
    const parsedObject = {};
    Object.entries(value).forEach(([key, childValue]) => {
      parsedObject[key] = parseCustomDimension(childValue);
    });
    return parsedObject;
  }
  return value;
};

const parseStandardDimension = value => (
  value === '(not set)' ? null : value
);


const fetchAnalyticsRows = (dimensions, page = 0) => new Promise((resolve, reject) => {
  // Fetch session data from the last 24-48 hours.
  const maximumAgeInDays = parseInt(process.env.MAXIMUM_AGE || 1, 10);
  const endDate = moment().format('YYYY-MM-DD');
  const startDate = moment().subtract(maximumAgeInDays, 'days').format('YYYY-MM-DD');

  // This is the maximum value allowed by the API.
  const maxResults = 10000;
  const startIndex = 1 + (page * maxResults);

  gaApi({
    // Credential details.
    clientId: 'user-agents-npm-package-update.apps.googleusercontent.com',
    email: 'user-agents-npm-package-update@user-agents-npm-package.iam.gserviceaccount.com',
    key: 'google-analytics-credentials.json',
    ids: 'ga:115995502',
    // Request details.
    endDate,
    dimensions: dimensions.join(','),
    maxResults,
    metrics: 'ga:sessions',
    sort: sessionIdDimension,
    startDate,
    startIndex,
  }, (error, data) => {
    if (error) {
      return reject(error);
    }
    return resolve(data.rows);
  }, { cacheDir: '.' });
});


const getRawSessions = async () => {
  // We can request a maximum of 7 dimensions at once, so we need to break these up into groups
  // of 6 + 1 (the 1 being the session ID). We can then join these together into higher dimensional
  // objects based on the common session IDs.
  const maximumDimensionsPerRequest = 7;
  const dimensions = Object.keys(customDimensionMap).concat(Object.keys(standardDimensionMap));
  const dimensionGroupCount = Math.ceil(dimensions.length / (maximumDimensionsPerRequest - 1));
  const dimensionGroups = [];
  for (let i = 0; i < dimensionGroupCount; i += 1) {
    const startIndex = (maximumDimensionsPerRequest - 1) * i;
    const endIndex = (startIndex + maximumDimensionsPerRequest) - 1;
    dimensionGroups.push([sessionIdDimension].concat(dimensions.slice(startIndex, endIndex)));
  }

  // Now we loop through and paginate the results, joining the dimensions by session ID as we go.
  const sessions = {};
  const groupCounts = {};
  let page = 0;
  let newRowCount;
  do {
    newRowCount = 0;
    for (let groupIndex = 0; groupIndex < dimensionGroupCount; groupIndex += 1) {
      const dimensionGroup = dimensionGroups[groupIndex];
      const rows = (await fetchAnalyticsRows(dimensionGroup, page)) || [];
      newRowCount = Math.max(newRowCount, rows.length);
      rows.forEach((row) => {
        const sessionId = row[0];
        groupCounts[sessionId] = (groupCounts[sessionId] || 0) + 1;

        sessions[sessionId] = sessions[sessionId] || {};
        // Exclude the session ID (first) and the session count metric (last).
        row.slice(1, -1).forEach((value, index) => {
          sessions[sessionId][dimensionGroup[index + 1]] = value;
        });
      });
    }

    // Move on to the next page of requests if necessary.
    page += 1;
  } while (newRowCount > 0);

  // Delete any partial data.
  Object.keys(sessions).forEach((sessionId) => {
    if (groupCounts[sessionId] !== dimensionGroupCount) {
      delete sessions[sessionId];
    }
  });

  return sessions;
};


const parseSessions = (rawSessions) => {
  const sessions = {};
  Object.entries(rawSessions).forEach(([sessionId, rawSession]) => {
    const session = {
      timestamp: parseInt(sessionId.split('-')[0], 10),
    };

    Object.entries(customDimensionMap).forEach(([rawDimension, dimension]) => {
      const json = dimension === 'connection';
      session[dimension] = parseCustomDimension(rawSession[rawDimension], json);
      if (dimension === 'connection' && session[dimension]) {
        if (session[dimension].rtt) {
          session[dimension].rtt = parseInt(session[dimension].rtt, 10);
        }
        if (session[dimension].downlink) {
          session[dimension].downlink = parseFloat(session[dimension].downlink);
        }
        if (session[dimension].downlinkMax) {
          session[dimension].downlinkMax = parseFloat(session[dimension].downlinkMax);
        }
      }

      if (dimension === 'pluginsLength') {
        session[dimension] = parseInt(session[dimension], 10);
      }
    });

    Object.entries(standardDimensionMap).forEach(([rawDimension, dimension]) => {
      const value = parseStandardDimension(rawSession[rawDimension]);
      if (dimension === 'browserSize' || dimension === 'screenResolution') {
        let height = null;
        let width = null;
        if (/\d+x\d+/.test(value)) {
          [width, height] = value.split('x').map(pixels => parseInt(pixels, 10));
        }
        const dimensionPrefix = dimension === 'browserSize' ? 'viewport' : 'screen';
        session[`${dimensionPrefix}Height`] = height;
        session[`${dimensionPrefix}Width`] = width;
      } else {
        session[dimension] = value;
      }
    });

    sessions[sessionId] = session;
  });

  return sessions;
};


const getUserAgentTable = async () => {
  // Fetch the sessions and process them into parsed objects.
  const rawSessions = await getRawSessions();
  const sessions = parseSessions(rawSessions);

  // Calculate the number of unique occurrences of each fingerprint.
  const uniqueSessions = {};
  Object.values(sessions).forEach((session) => {
    // Exclude headless browser user agents.
    if (/headless/i.test(session.userAgent)) {
      return;
    }

    const uniqueKey = jsonStableStringify(session);
    if (!uniqueSessions[uniqueKey]) {
      uniqueSessions[uniqueKey] = {
        ...session,
        weight: 0,
      };
      delete uniqueSessions[uniqueKey].timestamp;
    }
    uniqueSessions[uniqueKey].weight += 1;
  });

  // Normalize the weights to 1.
  let totalWeight = 0;

  const n = () => random.normal();
  Object.values(uniqueSessions).forEach((session) => {
    // eslint-disable-next-line no-param-reassign
    session.weight = Array(2 * session.weight).fill().reduce(sum => sum + (n()() ** 2), 0) / 2;
    totalWeight += session.weight;
  });
  Object.values(uniqueSessions).forEach((session) => {
    // eslint-disable-next-line no-param-reassign
    session.weight /= totalWeight;
  });

  // Sort them by descreasing weight.
  const sessionList = Object.values(uniqueSessions);
  sessionList.sort((a, b) => b.weight - a.weight);

  return sessionList;
};


if (!module.parent) {
  const filename = process.argv[2];
  if (!filename) {
    throw new Error('An output filename must be passed as an argument to the command.');
  }
  getUserAgentTable().then(async (userAgents) => {
    const stringifiedUserAgents = JSON.stringify(userAgents, null, 2);
    // Compress the content if the extension ends with `.gz`.
    const content = filename.endsWith('.gz')
      ? gzipSync(stringifiedUserAgents)
      : stringifiedUserAgents;
    fs.writeFileSync(filename, content);
  })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      process.exit(1);
    });
}


export default getUserAgentTable;
