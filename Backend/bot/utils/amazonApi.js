import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getAmazonProductInfo(link) {
  try {
    // Resolve o redirecionamento do link encurtado (bit.ly, amzn.to, etc.)
    const resolved = await axios.get(link, {
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });

    const $ = cheerio.load(resolved.data);

    const title = $('#productTitle').text().trim();
    const image = $('#landingImage').attr('src') || $('img#imgBlkFront').attr('src');
    const price = $('#priceblock_ourprice').text().trim()
                || $('#priceblock_dealprice').text().trim()
                || $('span.a-offscreen').first().text().trim();

    if (!title || !image || !price) {
      console.error('❌ Falha ao extrair dados da página Amazon.');
      return null;
    }

    return {
      titulo: title,
      preco: price,
      imagem: image,
      link: resolved.request.res.responseUrl || link
    };
  } catch (err) {
    console.error('❌ Erro Amazon API/Scraping:', err.message);
    return null;
  }
}
