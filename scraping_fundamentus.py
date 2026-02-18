import requests
import pandas as pd
from bs4 import BeautifulSoup
import re

url = "https://www.fundamentus.com.br/resultado.php"

headers = {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "pt-BR,pt;q=0.9"
}

r = requests.get(url, headers=headers)
r.encoding = "ISO-8859-1"

soup = BeautifulSoup(r.text, "html.parser")
table = soup.find("table", id="resultado")

cols = [th.text.strip() for th in table.find_all("th")]
rows_acoes = []
rows_fiis = []

for tr in table.find_all("tr")[1:]:
    tds = [td.text.strip() for td in tr.find_all("td")]
    if not tds:
        continue
    papel = tds[0]

    if papel.endswith("11"):
        rows_fiis.append(tds)
    elif re.search(r"[3456]$", papel):
        rows_acoes.append(tds)

df_acoes = pd.DataFrame(rows_acoes, columns=cols)
df_fiis = pd.DataFrame(rows_fiis, columns=cols)

# Salva nos JSON
df_acoes.to_json("data/acoes.json", orient="records", force_ascii=False)
df_fiis.to_json("data/fiis.json", orient="records", force_ascii=False)

print("Ações:", len(df_acoes))
print("FIIs:", len(df_fiis))
