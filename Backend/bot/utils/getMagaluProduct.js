// utils/getMagaluProduct.js
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getMagaluProductInfo(link) {
  try {
    const { data } = await axios.get(link);
    const $ = cheerio.load(data);

    const titulo = $('h1.header-product__title').text().trim();
    const preco = $('div.header-product__price > span > span').first().text().trim();
    const imagem = $('img[data-testid="image-zoom"]')?.attr('src');

    return {
      titulo,
      preco,
      preco_antigo: '',
      imagem
    };
  } catch (error) {
    console.error('Erro Magalu:', error);
    return null;
  }
}
