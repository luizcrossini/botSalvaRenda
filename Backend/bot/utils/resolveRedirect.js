import axios from 'axios';

export async function resolveShopeeLink(shortUrl) {
  try {
    const response = await axios.get(shortUrl, {
      maxRedirects: 5,
      validateStatus: status => status >= 200 && status < 400
    });

    return response.request.res.responseUrl;
  } catch (error) {
    console.error('Erro ao resolver link Shopee:', error.message);
    return null;
  }
}