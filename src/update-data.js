/* eslint-disable import/no-extraneous-dependencies */
import fs from "fs";
import { gzipSync } from "zlib";

import * as dynamoose from "dynamoose";
import stableStringify from "fast-json-stable-stringify";
import isbot from "isbot";
import random from "random";
import UAParser from "ua-parser-js";

const ddb = new dynamoose.aws.ddb.DynamoDB({
  region: "us-east-2",
});
dynamoose.aws.ddb.set(ddb);

const SubmissionModel = dynamoose.model(
  "userAgentsAnalyticsSubmissionTable",
  new dynamoose.Schema(
    {
      id: {
        type: String,
        hashKey: true,
      },
      ip: String,
      profile: Object,
    },
    {
      saveUnknown: ["profile.**"],
      timestamps: { createdAt: "timestamp", updatedAt: undefined },
    },
  ),
  { create: false, update: false },
);

const getUserAgentTable = async (limit = 1e4) => {
  const minimumTimestamp = Date.now() - 1 * 24 * 60 * 60 * 1000;

  // Scan through all recent profiles keeping track of the count of each.
  let lastKey = null;
  const countsByProfile = {};
  let totalCount = 0;
  let uniqueCount = 0;
  let ipAddressAlreadySeen = {};
  do {
    const scan = SubmissionModel.scan(
      new dynamoose.Condition().filter("timestamp").gt(minimumTimestamp),
    );
    if (lastKey) {
      scan.startAt(lastKey);
    }

    const response = await scan.exec();
    response.forEach(({ ip, profile }) => {
      // Only count one profile per IP address.
      if (ipAddressAlreadySeen[ip]) return;
      ipAddressAlreadySeen[ip] = true;

      // Filter out bots like Googlebot and YandexBot.
      if (isbot(profile.userAgent)) return;

      // Track the counts for this exact profile.
      const stringifiedProfile = stableStringify(profile);
      if (!countsByProfile[stringifiedProfile]) {
        countsByProfile[stringifiedProfile] = 0;
        uniqueCount += 1;
      }
      countsByProfile[stringifiedProfile] += 1;
      totalCount += 1;
    });

    lastKey = response.lastKey;
  } while (lastKey);

  // Add some noise to the counts/weights.
  const n = () => random.normal();
  Object.entries(countsByProfile).forEach(([stringifiedProfile, count]) => {
    const unnormalizedWeight =
      Array(2 * count)
        .fill()
        .reduce((sum) => sum + n()() ** 2, 0) / 2;
    countsByProfile[stringifiedProfile] = unnormalizedWeight;
  });

  // Accumulate the profiles and add/remove a few properties to match the historical format.
  const profiles = [];
  for (let stringifiedProfile in countsByProfile) {
    if (countsByProfile.hasOwnProperty(stringifiedProfile)) {
      const profile = JSON.parse(stringifiedProfile);
      profile.weight = countsByProfile[stringifiedProfile];
      delete profile.sessionId;

      // Deleting these because they weren't in the old format, but we should leave them in...
      delete profile.language;
      delete profile.oscpu;

      // Find the device category.
      const parser = new UAParser(profile.userAgent);
      const device = parser.getDevice();
      // Sketchy, but I validated this on historical data and it is a 100% match.
      profile.deviceCategory =
        { mobile: "mobile", tablet: "tablet", undefined: "desktop" }[
          `${device.type}`
        ] ?? "desktop";

      profiles.push(profile);
      delete countsByProfile[stringifiedProfile];
    }
  }

  // Sort by descending weight.
  profiles.sort((a, b) => b.weight - a.weight);

  // Apply the count limit and normalize the weights.
  profiles.splice(limit);
  const totalWeight = profiles.reduce(
    (total, profile) => total + profile.weight,
    0,
  );
  profiles.forEach((profile) => {
    profile.weight /= totalWeight;
  });

  return profiles;
};

if (!module.parent) {
  const filename = process.argv[2];
  if (!filename) {
    throw new Error(
      "An output filename must be passed as an argument to the command.",
    );
  }
  getUserAgentTable()
    .then(async (userAgents) => {
      const stringifiedUserAgents = JSON.stringify(userAgents, null, 2);
      // Compress the content if the extension ends with `.gz`.
      const content = filename.endsWith(".gz")
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
