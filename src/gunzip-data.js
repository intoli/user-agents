import fs from 'fs';
import { gunzipSync } from 'zlib';


const gunzipData = (inputFilename) => {
  if (!inputFilename || !inputFilename.endsWith('.gz')) {
    throw new Error('Filename must be specified and end with `.gz` for gunzipping.');
  }
  const outputFilename = inputFilename.slice(0, -3);
  const compressedData = fs.readFileSync(inputFilename);
  const data = gunzipSync(compressedData);
  fs.writeFileSync(outputFilename, data);
};


if (!module.parent) {
  const inputFilename = process.argv[2];
  gunzipData(inputFilename);
}


export default gunzipData;
