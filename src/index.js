const puppeteer = require("puppeteer");
const creawler = require("crawler");
const fs = require("fs");
const { Parser } = require("json2csv");

let data = [];
async function extraction() {
  try {
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage(); // inicializar o navegador
    await page.setViewport({
      width: 1920,
      height: 1080
    });

    let lines = await getLine(page);
    for (let x = 0; x < lines.length; x++) {
      if (lines[x] != "-1") {
        await page.goto(
          `http://www.emdec.com.br/ABusInf/consultarlinha.asp?linha=${lines[x]}-0&Sistema=&Ed=0&consulta=1`
        );
        const descricao_linha = await page.$eval("#taid", el => el.textContent);
        const linha = await page.evaluate(
          () => document.getElementsByName("txtPesquisa")[0].defaultValue
        );

        const empresa = await page.evaluate(
          () => document.getElementsByName("txtEmpresa")[0].defaultValue
        );
        const objData = {
          linha: linha,
          desc: descricao_linha,
          empresa: empresa
        };
        data.push(objData);
        const parser = new Parser();
        const csv = parser.parse(data);
        fs.writeFileSync("./dados-endec.csv", csv, "utf-8");
        delay();
      }
    }

    browser.close();
  } catch (err) {
    console.error(err);
  }
}

async function getLine(page) {
  await page.goto("http://www.emdec.com.br/ABusInf/consultarlinha.asp");
  await page.waitForSelector("#ltLinhas");
  const selectOptions = await page.$$eval("#ltLinhas > option", options => {
    return options.map(option => option.value);
  });

  return selectOptions;
}
async function delay() {
  await sleep(1000);
  console.log(`Passando 1 Segundo...`);
}

async function sleep(ml) {
  setTimeout(() => {
    return Promise.resolve();
  }, ml);
}

extraction();
