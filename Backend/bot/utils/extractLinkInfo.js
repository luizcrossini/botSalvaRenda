
import axios from 'axios';
import { createHmac } from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

const appId = process.env.SHOPEE_APP_ID;
const appSecret = process.env.SHOPEE_SECRET;

export async function resolveShopeeLink(shortUrl) {
  try {
    const response = await axios.get(shortUrl, { maxRedirects: 5 });
    return response.request.res.responseUrl;
  } catch (error) {
    console.error('❌ Erro ao resolver link:', error.message);
    return null;
  }
}

export function extractIdsFromUrl(url) {
  const match = url.match(/product\/(\d+)\/(\d+)/);
  if (match) {
    return { shopId: match[1], itemId: match[2] };
  }
  const match2 = url.match(/i\.(\d+)\.(\d+)/);
  if (match2) {
    return { shopId: match2[1], itemId: match2[2] };
  }
  return null;
}

export async function getShopeeProductInfoFromIds(shopId, itemId) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const query = `query {
      productOfferDetail(input: {
        itemId: ${Number(itemId)},
        shopId: ${Number(shopId)}
      }) {
        productName
        imageUrl
        price
        priceMin
      }
    }`;

    const baseString = `\${appId}\${timestamp}\${query}`;
    const signature = createHmac('sha256', appSecret).update(baseString).digest('hex');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `SHA256 Credential=\${appId},Timestamp=\${timestamp},Signature=\${signature}`
    };

    const payload = { query };

    const response = await axios.post('https://open-api.affiliate.shopee.com.br/graphql', payload, { headers });
    return response.data?.data?.productOfferDetail || null;
  } catch (error) {
    console.error('❌ Erro Shopee API/Scraping:', error.message);
    return null;
  }
}

export async function getProductInfo(shortUrl) {
  const resolvedUrl = await resolveShopeeLink(shortUrl);
  if (!resolvedUrl) return null;

  const ids = extractIdsFromUrl(resolvedUrl);
  if (!ids) {
    console.error('❌ Nenhum padrão de shopId/itemId encontrado na URL:', resolvedUrl);
    return null;
  }

  const productData = await getShopeeProductInfoFromIds(ids.shopId, ids.itemId);
  if (!productData) {
    console.error('❌ Dados do produto não encontrados para:', ids);
    return null;
  }

  return {
    shopId: ids.shopId,
    itemId: ids.itemId,
    productData
  };
}

export function checkLinkOrigin(receivedLink) {
  if (/shopee\./i.test(receivedLink)) return 'shopee';
  if (/amzn\.to|amazon\./i.test(receivedLink)) return 'amazon';
  if (/magazineluiza\.com/i.test(receivedLink)) return 'magalu';
  if (/natura\./i.test(receivedLink)) return 'natura';
  if (/mercadolivre\./i.test(receivedLink)) return 'mercadolivre';
  return null;
}
