import cheerio from 'cheerio';
import fs from 'fs';
import https from 'https';


const getUserAgentTable = () => new Promise((resolve, reject) => {
  const url = 'https://techblog.willshouse.com/2012/01/03/most-common-user-agents/';
  https.get(url, (response) => {
    let body = '';
    response.on('data', (data) => { body += data; });
    response.on('end', () => {
      const $ = cheerio.load(body);
      const userAgents = $('table.most-common-user-agents tbody tr')
        .map((index, element) => {
          const tr = $(element);
          return {
            marketShare: parseFloat(tr.find('td.percent').text().replace('%', '')) / 100.0,
            system: tr.find('td.system').text(),
            useragent: tr.find('td.useragent').text(),
          };
        })
        .get();
      resolve(userAgents);
    });
  }).on('error', reject);
});


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
