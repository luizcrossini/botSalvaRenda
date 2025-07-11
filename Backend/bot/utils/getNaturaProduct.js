import puppeteer from 'puppeteer';

export function isNaturaLink(link) {
  return link.includes('natura.com');
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function getNaturaProductInfo(link) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.waitForSelector('h1.text-2xl', { timeout: 15000 });
    await delay(1500); // tempo extra para carregar os preços

    const title = await page.$eval('h1.text-2xl', el => el.innerText.trim());

    // 🧠 Captura todos os preços e classifica
    const prices = await page.$$eval('span', spans => {
      return spans.map(span => {
        const text = span.innerText.trim();
        const className = span.className || '';
        const match = text.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
        if (match) {
          return {
            value: match[1],
            raw: text,
            className
          };
        }
        return null;
      }).filter(p => p);
    });

    let promotional = null;
    let regular = null;

    for (const p of prices) {
      if (p.className.includes('line-through')) {
        if (!regular) regular = p.value;
      } else {
        if (!promotional) promotional = p.value;
      }
    }

    const price = promotional || regular || 'Preço não encontrado';
    const preco_antigo = promotional ? regular : null;

    const image = await page.$$eval('img', imgs => {
  const validImages = imgs.map(img => img.src).filter(src => src && src.startsWith('http'));
  return validImages[1] || validImages[0] || ''; // pega a 2ª se existir, senão a 1ª
});

    await browser.close();

    return {
      title,
      price,
      preco_antigo,
      image,
      link
    };

  } catch (error) {
    await browser.close();
    console.error('❌ Erro ao extrair produto:', error.message);
    return {
      title: 'Erro ao extrair',
      price: '',
      preco_antigo: '',
      image: '',
      link
    };
  }
}
