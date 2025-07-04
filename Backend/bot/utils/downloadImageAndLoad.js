import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Baixa a imagem do link e salva localmente como ./temp/temp_image.jpg
 * Cria a pasta ./temp se ela não existir
 * @param {string} imageUrl - URL da imagem a ser baixada
 * @param {string} filename - Nome do arquivo (padrão: temp_image.jpg)
 * @returns {string} Caminho local do arquivo salvo
 */
export async function downloadImage(imageUrl, filename = 'temp_image.jpg') {
  try {
    // Caminho para a pasta ./temp e arquivo
    const tempFolder = path.join('./temp');
    const tempPath = path.join(tempFolder, filename);

    // Cria a pasta se não existir
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder);
    }

    // Faz download da imagem
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    // Salva localmente
    fs.writeFileSync(tempPath, response.data);

    return tempPath;
  } catch (err) {
    console.error('Erro ao baixar a imagem:', err.message);
    throw err;
  }
}