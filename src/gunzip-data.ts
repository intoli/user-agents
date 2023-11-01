import fs from 'fs';
import { argv } from 'process';
import { fileURLToPath } from 'url';
import { gunzipSync } from 'zlib';

const gunzipData = (inputFilename?: string) => {
  if (!inputFilename || !inputFilename.endsWith('.gz')) {
    throw new Error('Filename must be specified and end with `.gz` for gunzipping.');
  }
  const outputFilename = inputFilename.slice(0, -3);
  const compressedData = fs.readFileSync(inputFilename);
  const data = gunzipSync(compressedData);
  fs.writeFileSync(outputFilename, data);
};

if (fileURLToPath(import.meta.url) === argv[1]) {
  const inputFilename = process.argv[2];
  gunzipData(inputFilename);
}

export default gunzipData;
