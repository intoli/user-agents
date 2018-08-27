/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';

import jsonStableStringify from 'json-stable-stringify';
import gaApi from 'ga-api';
import moment from 'moment';
import { normal as n } from 'random';


// Custom dimensions, see: https://intoli.com/blog/user-agents/
const customDimensionMap = {
  'ga:dimension1': 'appName',
  'ga:dimension2': 'connection',
  'ga:dimension3': 'cpuClass',
  'ga:dimension5': 'osCpu',
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
    return parseCustomDimension(JSON.parse(value));
  }
  if (typeof value === 'object') {
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
  const maximumAgeInDays = process.env.MAXIMUM_AGE || 1;
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
  });
});


const getUserAgentTable = () => Promise.resolve();


if (!module.parent) {
  const filename = process.argv[2];
  if (!filename) {
    throw new Error('An output filename must be passed as an argument to the command.');
  }
  getUserAgentTable().then((userAgents) => {
    fs.writeFileSync(filename, JSON.stringify(userAgents, null, 2));
  });
}


export default getUserAgentTable;
