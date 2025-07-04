import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

/**
 * Função auxiliar para quebrar linhas automaticamente.
 */
function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}


export async function generateStoryImage({ title, price, image, templatePath, outputPath }) {
  try {
    const template = await loadImage(templatePath);
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext('2d');

    // 🖼️ Fundo do template
    ctx.drawImage(template, 0, 0, template.width, template.height);

    // 📦 Imagem do produto centralizada e menor
    const productImage = await loadImage(image);
 // Defina o tamanho máximo permitido
const maxWidth = 400;
const maxHeight = 400;

// Calcula proporção para manter o aspect ratio da imagem
let productWidth = productImage.width;
let productHeight = productImage.height;

if (productWidth > maxWidth || productHeight > maxHeight) {
  const widthRatio = maxWidth / productWidth;
  const heightRatio = maxHeight / productHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  productWidth = productWidth * ratio;
  productHeight = productHeight * ratio;
}

// Centraliza a imagem no canvas
const productX = (canvas.width - productWidth) / 2;
const productY = 250; // você pode ajustar esse valor conforme o layout

ctx.drawImage(productImage, productX, productY, productWidth, productHeight);
    // 🏷️ Título do produto
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#000000';
    const titleX = 80;
    const titleY = 700;
    drawMultilineText(ctx, title || 'Produto sem título', titleX, titleY, 640, 40);

    // 💰 Preço destacado em retângulo amarelo com texto preto
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#000000';
    const priceText = `${price}` || 'Preço indisponível';
    const priceX = 80;
    const priceY = titleY + 100;
    const priceWidth = ctx.measureText(priceText).width + 40;
    const priceHeight = 70;

    ctx.fillStyle = '#000000';
    ctx.fillRect(priceX, priceY, priceWidth, priceHeight);
    ctx.fillStyle = '#FFFF00';
    ctx.fillText(priceText, priceX + 20, priceY + 50);

    // 💾 Salvar imagem final
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(outputPath, buffer);
    console.log('✅ Imagem gerada:', outputPath);

    return outputPath;
  } catch (err) {
    console.error('❌ Erro ao gerar story:', err.message);
    throw err;
  }
}
