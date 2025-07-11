import axios from 'axios';
import * as cheerio from 'cheerio';

export function isMercadoLivreLink(link) {
  return link.includes('mercadolivre.com');
}

// Função para resolver link encurtado até obter link final com /MLB-
export async function resolveMercadoLivreLink(link) {
  try {
    const { data: html } = await axios.get(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      maxRedirects: 5
    });

    const $ = cheerio.load(html);
    const productLink = $('a.poly-component__link--action-link').attr('href');

    if (!productLink) {
      throw new Error('❌ Link de produto não encontrado na página.');
    }

    return productLink.startsWith('http') ? productLink : `https://www.mercadolivre.com.br${productLink}`;
  } catch (err) {
    console.error('❌ Erro ao resolver link do Mercado Livre:', err.message);
    return null;
  }
}

export async function getMercadoLivreProductInfo(link) {
  try {
    const resolvedLink = await resolveMercadoLivreLink(link);
    if (!resolvedLink) throw new Error('❌ Não foi possível resolver o link do produto.');

    const { data: html } = await axios.get(resolvedLink, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(html);

    const title = $('h1.ui-pdp-title').text().trim();
    const priceText = $('span.andes-money-amount__fraction').first().text().trim();
    const cents = $('span.andes-money-amount__cents').first().text().trim();
    const price = parseFloat(`${priceText}.${cents || '00'}`);

    let image =
  $('img.ui-pdp-image.ui-pdp-gallery__figure__image').first().attr('src') ||
  $('figure.ui-pdp-gallery__figure img').first().attr('src') ||
  $('img[data-src]').first().attr('data-src') ||
  $('img').filter((_, el) => $(el).attr('src')?.includes('http') && $(el).attr('src')?.includes('ML')).first().attr('src');



    if (!title || isNaN(price) || !image) {
      throw new Error('❌ Produto retornou dados incompletos.');
    }

    return {
      title,
      price: `R$ ${price.toFixed(2).replace('.', ',')}`,
      preco_num: price,
      image,
      link: resolvedLink,
    };
  } catch (error) {
    console.error('❌ Erro ao extrair produto Mercado Livre:', error.message);
    return {
      title: 'Erro ao extrair dados',
      price: '',
      preco_num: 0,
      image: '',
      link,
    };
  }
}