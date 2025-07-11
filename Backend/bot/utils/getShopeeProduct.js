import puppeteer from 'puppeteer';

export function isShopeeLink(link) {
  return link.includes('shopee.com');
}

export async function getShopeeProductInfo(shortUrl) {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    let productInfo = null;

    // Intercepta chamadas da API interna
    page.on('response', async (response) => {
      const reqUrl = response.url();
      if (reqUrl.includes('/api/v4/item/get')) {
        try {
          const json = await response.json();
          const data = json.item_basic;

          productInfo = {
            titulo: data.name,
            preco: `R$ ${(data.price / 100000).toFixed(2).replace('.', ',')}`,
            preco_antigo: data.price_before_discount
              ? `R$ ${(data.price_before_discount / 100000).toFixed(2).replace('.', ',')}`
              : null,
            image: `https://down-br.img.susercontent.com/file/${data.image}`,
            link: shortUrl,
          };
        } catch (err) {
          console.error('Erro ao processar JSON:', err.message);
        }
      }
    });

    // Acessa a página final
    await page.goto(shortUrl, { waitUntil: 'networkidle2' });

    // Aguarda alguns segundos para garantir que o JSON seja interceptado
    await page.waitForTimeout(4000);

    await browser.close();

    if (!productInfo) {
      throw new Error('❌ Produto não encontrado ou JSON não interceptado.');
    }

    return productInfo;
  } catch (error) {
    console.error('❌ Erro ao buscar produto Shopee:', error.message);
    return {
      titulo: 'Erro',
      preco: '',
      preco_antigo: '',
      image: '',
      link: shortUrl,
    };
  }
}