import { isAmazonLink, getAmazonProductInfo } from './getAmazonProduct.js';
import { isShopeeLink, getShopeeProductInfo } from './getShopeeProduct.js';
import { isMercadoLivreLink, getMercadoLivreProductInfo } from './getMercadoLivreProduct.js';
import { isNaturaLink, getNaturaProductInfo } from './getNaturaProduct.js';

export async function getProductInfo(link) {
  try {
    if (isAmazonLink(link)) {
      const product = await getAmazonProductInfo(link);
      if (product?.title && product?.image && product?.price) {
        return product;
      } else {
        throw new Error('Amazon retornou dados incompletos.');
      }
    }

    if (isShopeeLink(link)) {
      const product = await getShopeeProductInfo(link);
      if (product?.title && product?.image && product?.price) {
        return product;
      } else {
        throw new Error('Shopee retornou dados incompletos.');
      }
    }
if (isMercadoLivreLink(link)) {
      const product = await getMercadoLivreProductInfo(link);
      if (product?.title && product?.image && product?.price) {
        return product;
      } else {
        throw new Error('Mercado livre retornou erro.');
      }
    }

    if (isNaturaLink(link)) {
      const product = await getNaturaProductInfo(link);
      if (product?.title && product?.image && product?.price) {
        return product;
      } else {
        throw new Error('Natura retornou erro.');
      }
    }
    return {
      title: 'Plataforma não suportada',
      price: '',
      image: '',
      link
    };

  } catch (error) {
    console.error('❌ Erro ao buscar produto:', error.message);
    return {
      title: 'Erro na extração',
      price: '',
      image: '',
      link
    };
  }
}
