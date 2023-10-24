/* eslint-disable import/no-extraneous-dependencies */
import fs from "fs";
import { gzipSync } from "zlib";

import * as dynamoose from "dynamoose";
import stableStringify from "fast-json-stable-stringify";
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
      headers: Object,
      ip: String,
      origin: String,
      profile: Object,
    },
    {
      saveUnknown: ["headers.*", "profile.**"],
      timestamps: { createdAt: "timestamp", updatedAt: undefined },
    },
  ),
  { create: false, update: false },
);

const getUserAgentTable = async () => {
  const minimumTimestamp = Date.now() - 1 * 24 * 60 * 60 * 1000;
  // For debugging.
  const limit = 0;
  const uniqueLimit = 0;

  // Scan through all recent profiles keeping track of the count of each.
  let lastKey = null;
  const countsByProfile = {};
  let totalCount = 0;
  let uniqueCount = 0;
  do {
    console.log(totalCount, uniqueCount);
    const scan = SubmissionModel.scan(
      new dynamoose.Condition().filter("timestamp").gt(minimumTimestamp),
    );
    if (lastKey) {
      scan.startAt(lastKey);
    }

    const response = await scan.exec();
    response.forEach(({ profile }) => {
      const stringifiedProfile = stableStringify(profile);
      if (!countsByProfile[stringifiedProfile]) {
        countsByProfile[stringifiedProfile] = 0;
        uniqueCount += 1;
      }
      countsByProfile[stringifiedProfile] += 1;
      totalCount += 1;
    });

    lastKey = response.lastKey;
  } while (
    lastKey &&
    (!limit || totalCount < limit) &&
    (!uniqueLimit || uniqueCount < uniqueLimit)
  );

  // Add some noise to the weights.
  let totalWeight = 0;
  const n = () => random.normal();
  Object.entries(countsByProfile).forEach(([stringifiedProfile, count]) => {
    const unnormalizedWeight =
      Array(2 * count)
        .fill()
        .reduce((sum) => sum + n()() ** 2, 0) / 2;
    countsByProfile[stringifiedProfile] = unnormalizedWeight;
    totalWeight += unnormalizedWeight;
  });

  // Accumulate the profiles and add/remove a few properties to match the historical format.
  const profiles = [];
  for (let stringifiedProfile in countsByProfile) {
    if (countsByProfile.hasOwnProperty(stringifiedProfile)) {
      const profile = JSON.parse(stringifiedProfile);
      profile.weight = countsByProfile[stringifiedProfile] / totalWeight;
      delete profile.sessionId;

      // Find the device category
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
      const stringifiedUserAgents = JSON.stringify(
        userAgents.slice(0, 1e5),
        null,
        2,
      );
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
