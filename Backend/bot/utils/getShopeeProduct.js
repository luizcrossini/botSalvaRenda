import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const APP_ID = process.env.SHOPEE_APP_ID;
const SECRET = process.env.SHOPEE_SECRET;

export async function getShopeeProductInfo(url) {
  try {
    // Etapa 1: Consulta à API oficial da Shopee Afiliados
    const apiUrl = 'https://affiliate.shopee.com.br/api/v1/product_link/info';
    const response = await axios.post(
      apiUrl,
      { url },
      {
        headers: {
          'x-partner-id': APP_ID,
          'x-partner-key': SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;

    if (!data || !data.data) {
      throw new Error('Shopee retornou dados incompletos.');
    }

    const produto = data.data;

    return {
      titulo: produto.name || 'Produto sem nome',
      preco: produto.price || 'Preço não informado',
      preco_antigo: produto.original_price || '',
      image: produto.image_url,
      link: produto.product_url
    };

  } catch (error) {
    console.error('❌ Erro ao buscar produto Shopee:', error.message);
    return {
      titulo: 'Erro ao buscar produto Shopee',
      preco: '',
      preco_antigo: '',
      image: '',
      link: url
    };
  }
}

// Validador
export function isShopeeLink(link) {
  return link.includes('shopee.com.br');
}
