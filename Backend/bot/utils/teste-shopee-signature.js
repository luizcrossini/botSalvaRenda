// import crypto from 'crypto';

// const APP_ID = '18386150527';
// const SECRET = '3ZOXFDUMXE7KUXB6NK3WMGCH2V6YC3GK';
// const timestamp = Math.floor(Date.now() / 1000);

// // Payload simples de teste
// const payload = JSON.stringify({
//   query: 'query { ping }',
//   variables: {}
// });

// // Monta o signatureBase conforme documentação
// const signatureBase = `${APP_ID}${timestamp}${payload}${SECRET}`;

// // Gera o hash SHA256
// const signature = crypto
//   .createHmac('sha256', SECRET)
//   .update(signatureBase)
//   .digest('hex');

// // Monta o cabeçalho
// const authHeader = `SHA256 Credential=${APP_ID},Timestamp=${timestamp},Signature=${signature}`;

// console.log('\n✅ Comando CURL:');
// console.log(`curl -X POST https://open-api.affiliate.shopee.com.br/graphql \\`);
// console.log(`-H "Content-Type: application/json" \\`);
// console.log(`-H "Authorization: ${authHeader}" \\`);
// console.log(`-d '${payload}'`);


