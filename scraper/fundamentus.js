const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://www.fundamentus.com.br/resultado.php', {
    waitUntil: 'networkidle'
  });

  await page.waitForSelector('#resultado');

  const dados = await page.$$eval('#resultado tbody tr', rows => {
    return rows.map(row => {
      const c = row.querySelectorAll('td');
      return {
        Papel: c[0]?.innerText.trim(),
        Cotacao: c[1]?.innerText.trim(),
        PL: c[2]?.innerText.trim(),
        PVP: c[3]?.innerText.trim(),
        DY: c[5]?.innerText.trim(),
        ROE: c[7]?.innerText.trim(),
        Liquidez: c[9]?.innerText.trim(),
        ValorMercado: c[16]?.innerText.trim()
      };
    });
  });

  const acoes = dados.filter(d => d.Papel && !d.Papel.endsWith('11'));
  const fiis = dados.filter(d => d.Papel && d.Papel.endsWith('11'));

  fs.writeFileSync('data/acoes.json', JSON.stringify(acoes, null, 2));
  fs.writeFileSync('data/fiis.json', JSON.stringify(fiis, null, 2));

  console.log('JSONs gerados com sucesso');
  await browser.close();
})();
