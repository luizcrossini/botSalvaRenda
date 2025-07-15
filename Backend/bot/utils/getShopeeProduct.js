// 🔁 getShopeeProductInfo com Puppeteer e Cheerio (baseado em tags/classes do HTML)

import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';

export function isShopeeLink(link) {
  return link.includes('shopee.com');
}

/**
 * 🔁 Resolve o redirecionamento de um link de afiliado Shopee usando o Puppeteer
 */
export async function resolveShopeeAffiliateLink(url) {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const resolvedUrl = page.url();

    await browser.close();

    return resolvedUrl;
  } catch (error) {
    console.error('❌ Erro ao resolver link:', error.message);
    return null;
  }
}

/**
 * 🛍️ Extrai os dados do produto da Shopee via DOM com Puppeteer e Cheerio
 */
export async function getShopeeProductInfo(link) {
  try {
    const resolvedLink = await resolveShopeeAffiliateLink(link);
    if (!resolvedLink) throw new Error('❌ Não foi possível resolver o link');

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(resolvedLink, { waitUntil: 'domcontentloaded' });

    // Aguarda seletor da tag <h1> com título
    await page.waitForSelector('h1', { timeout: 15000 });

    const html = await page.content();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const image = $('meta[property="og:image"]').attr('content');

     console.log('título:', title)
    console.log('preço:', price)
    console.log('imagem:', image)

    // Tentativas de capturar preço
    let price = null;
    const priceSelectors = ['.pmmxKx', '._3n5NQx', '[class*=pdp-price]', '.pqTWkA', '.Ybrg9j'];
    for (const selector of priceSelectors) {
      const priceRaw = $(selector).first().text().trim();
      if (priceRaw) {
        price = priceRaw.replace(/[^\d,]/g, '').replace(',', '.');
        break;
      }
    }

    await browser.close();

    return {
      titulo: title,
      preco: price,
      image,
      link: resolvedLink,
    };
  } catch (error) {
    console.error('❌ Erro ao extrair produto:', error.message);
    return null;
  }
}
