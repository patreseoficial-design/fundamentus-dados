const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();

  console.log("Abrindo Fundamentus...");
  await page.goto("https://www.fundamentus.com.br/resultado.php", {
    waitUntil: "domcontentloaded",
    timeout: 300000 // 5 minutos
  });

  console.log("Esperando tabela...");
  await page.waitForSelector("table", { timeout: 300000 });

  const dados = await page.evaluate(() => {
    const table = document.querySelector("table");
    const headers = Array.from(table.querySelectorAll("th")).map(th =>
      th.innerText.trim()
    );

    const rows = Array.from(table.querySelectorAll("tbody tr"));

    return rows.map(tr => {
      const obj = {};
      const cols = tr.querySelectorAll("td");
      headers.forEach((h, i) => {
        obj[h] = cols[i]?.innerText.trim() || "";
      });
      return obj;
    });
  });

  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/acoes.json", JSON.stringify(dados, null, 2));

  console.log("JSON gerado com sucesso!");

  await browser.close();
})();
