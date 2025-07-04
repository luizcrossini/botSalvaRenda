export function formatMensagem(template, productData) {
  if (!template || !productData) return '';

  return template
    .replace(/{title}/gi, productData.title || 'Produto sem título')
    .replace(/{price}/gi, productData.price || 'Preço indisponível')
    .replace(/{link}/gi, productData.link || '');
}
