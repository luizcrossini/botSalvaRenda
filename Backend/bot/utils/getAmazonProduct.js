
import axios from 'axios';
import * as cheerio from 'cheerio';

export function isAmazonLink(link) {
  return /(?:amzn\.to|amazon\.(com\.br|com|[a-z]{2}))/i.test(link);
}

export async function resolveAmazonLink(link) {
  try {
    const response = await axios.get(link, { maxRedirects: 5 });
    return response.request.res.responseUrl;
  } catch (error) {
    console.error('Erro ao resolver link da Amazon:', error.message);
    return null;
  }
}

export function extractAmazonASIN(url) {
  const regex = /\/([A-Z0-9]{10})(?:[/?]|$)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function getAmazonProductInfo(link) {
  try {
    const resolvedUrl = await resolveAmazonLink(link);
    if (!resolvedUrl) throw new Error('URL não resolvida');

    const response = await axios.get(resolvedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    const $ = cheerio.load(response.data);

    const title =
      $('#productTitle').text().trim() ||
      $('title').text().trim() ||
      $('[data-asin-title]').text().trim();
console.log(title)
    const price =
      $('#priceblock_ourprice').text().trim() ||
      $('#priceblock_dealprice').text().trim() ||
      $('span.a-offscreen').first().text().trim();
console.log(price)
    const image =
      $('#imgTagWrapperId img').attr('src') ||
      $('meta[property="og:image"]').attr('content') ||
      $('img#landingImage').attr('src');
console.log(image)
    if (!image || !/^https?:\/\//i.test(image)) {
      throw new Error('Imagem do produto não encontrada ou inválida');
    }

    return {
      title: title || 'Produto sem título',
      price: price || 'Preço indisponível',
      image: image,
    };
  } catch (err) {
    console.error('Erro ao extrair produto da Amazon:', err.message);
    return null;
  }
}