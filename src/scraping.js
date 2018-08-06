import cheerio from 'cheerio';
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
            percent: parseFloat(tr.find('td.percent').text().replace('%', '')),
            system: tr.find('td.system').text(),
            useragent: tr.find('td.useragent').text(),
          };
        })
        .get();
      resolve(userAgents);
    });
  }).on('error', reject);
});


export default getUserAgentTable;
