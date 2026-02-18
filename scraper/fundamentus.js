const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Finge navegador real
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36");

  // Retry automático até 3 tentativas
  for (let i = 0; i < 3; i++) {
    try {
      await page.goto('https://www.fundamentus.com.br/resultado.php', {
        waitUntil: 'networkidle',
        timeout: 300000 // 5 minutos
      });
      await page.waitForSelector('#resultado', { timeout: 300000 });
      break;
    } catch(e) {
      console.log(`Tentativa ${i+1} falhou, tentando novamente...`);
      if (i === 2) throw e;
    }
  }

  // Lê a tabela
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

  // Separa Ações e FIIs
  const acoes = dados.filter(d => d.Papel && !d.Papel.endsWith('11'));
  const fiis = dados.filter(d => d.Papel && d.Papel.endsWith('11'));

  // Cria pasta data se não existir
  if (!fs.existsSync('data')) fs.mkdirSync('data');

  // Salva JSONs
  fs.writeFileSync('data/acoes.json', JSON.stringify(acoes, null, 2));
  fs.writeFileSync('data/fiis.json', JSON.stringify(fiis, null, 2));

  console.log('JSONs gerados com sucesso');

  // --- PUSH AUTOMÁTICO ---
  const { exec } = require('child_process');
  exec('git add data/acoes.json data/fiis.json && git commit -m "Atualiza JSONs do Fundamentus" && git push origin main', (err, stdout, stderr) => {
    if (err) console.log("Erro ao enviar para o GitHub:", err);
    else console.log("JSONs enviados para o GitHub!");
  });

  await browser.close();
})();
