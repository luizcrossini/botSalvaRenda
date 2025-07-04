// import axios from 'axios';
// import crypto from 'crypto';

// // Função para gerar o sign da Shopee
// function generateShopeeSign(partnerId, path, timestamp, accessToken, shopId, partnerKey) {
//   const baseString = `${partnerId}${path}${timestamp}${accessToken}${shopId}`;
//   return crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');
// }

// // Função principal que consulta a API de afiliados da Shopee
// export async function getShopeeProductInfo(link, shopId, accessToken, partnerId, partnerKey) {
//   try {
//     const match = link.match(/-i\.(\d+)\.(\d+)/);
//     if (!match) return null;

//     const itemId = match[2];
//     const path = '/api/v2/product/get_item_base_info';
//     const timestamp = Math.floor(Date.now() / 1000);
//     const sign = generateShopeeSign(partnerId, path, timestamp, accessToken, shopId, partnerKey);

//     const response = await axios.get(`https://partner.shopeemobile.com${path}`, {
//       params: {
//         partner_id: partnerId,
//         timestamp,
//         access_token: accessToken,
//         shop_id: shopId,
//         sign,
//         item_id_list: itemId,
//       },
//     });

//     const item = response.data?.response?.item_list?.[0];
//     if (!item) return null;

//     return {
//       titulo: item.item_name,
//       preco: (item.price / 100000).toFixed(2).replace('.', ','),
//       imagem: `https://cf.shopee.com.br/file/${item.image}`,
//       link,
//     };
//   } catch (err) {
//     console.error('❌ Erro ao buscar produto da Shopee API:', err.message);
//     return null;
//   }
// }
