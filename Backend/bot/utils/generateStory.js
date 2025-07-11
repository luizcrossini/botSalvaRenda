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


export async function generateStoryImage({ title, price, image, templatePath, outputPath, plataforma }) {
  try {
    const template = await loadImage(templatePath);
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext('2d');

    // 🖼️ Fundo
    ctx.drawImage(template, 0, 0, template.width, template.height);

    // 📦 Imagem do produto
    const productImage = await loadImage(image);

    // 🔄 Definir tamanho ideal baseado na plataforma
    let maxWidth = 400;
    let maxHeight = 400;

    switch (plataforma?.toLowerCase()) {
      case 'amazon':
        maxWidth = 300;
        maxHeight = 300;
        break;
      case 'mercado livre':
        maxWidth = 400;
        maxHeight = 400;
        break;
      case 'shopee':
        maxWidth = 400;
        maxHeight = 400;
        break;
      case 'natura':
        maxWidth = 400;
        maxHeight = 400;
      default:
        maxWidth = 380;
        maxHeight = 380;
    }

    // 🧮 Redimensionar mantendo proporção
    let productWidth = productImage.width;
    let productHeight = productImage.height;

    const widthRatio = maxWidth / productWidth;
    const heightRatio = maxHeight / productHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    productWidth *= ratio;
    productHeight *= ratio;

    const productX = (canvas.width - productWidth) / 2;
    const productY = 250;

    ctx.drawImage(productImage, productX, productY, productWidth, productHeight);

    // 🏷️ Título
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#000';
    drawMultilineText(ctx, title || 'Produto sem título', 80, 700, 640, 40);

    // 💰 Preço
    const priceText = price || 'Preço indisponível';
    ctx.font = 'bold 48px Arial';
    const priceX = 80;
    const priceY = 800;
    const priceWidth = ctx.measureText(priceText).width + 40;

    ctx.fillStyle = '#000';
    ctx.fillRect(priceX, priceY, priceWidth, 70);
    ctx.fillStyle = '#FFFF00';
    ctx.fillText(priceText, priceX + 20, priceY + 50);

    // 💾 Salvar
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(outputPath, buffer);
    console.log('✅ Imagem gerada:', outputPath);

    return outputPath;
  } catch (err) {
    console.error('❌ Erro ao gerar story:', err.message);
    throw err;
  }
}
