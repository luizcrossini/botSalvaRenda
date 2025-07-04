// backend/src/controllers/product.controller.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();
cloudinary.config({
  cloud_name:    process.env.CLOUD_NAME,
  api_key:       process.env.CLOUD_API_KEY,
  api_secret:    process.env.CLOUD_API_SECRET
});

export async function getProductInfo(req, res, next) {
  try {
// DEBUG: vê exatamente o que chega no body
    console.log('>>> [getProductInfo] req.body =', req.body);
    // usa operador de coalescência para nunca falhar no destructuring
    const link = req.body?.link;
    if (!link) {
      return res
        .status(400)
        .json({ error: 'O campo "link" é obrigatório no corpo da requisição.' });
    }

    // 1) Faz fetch do HTML
    const page = await axios.get(link);
    const $    = cheerio.load(page.data);
    // 2) Extrai título, preços e URL da imagem principal
    const title       = $('meta[property="og:title"]').attr('content') || $('title').text();
    const price       = $('meta[property="product:price:amount"]').attr('content');
    const oldPrice    = $('selector-do-preço-antigo').text().trim() || price;
    const imgUrl      = $('meta[property="og:image"]').attr('content');

    // 3) Upload da imagem do produto ao Cloudinary
    const upload = await cloudinary.uploader.upload(imgUrl, {
      folder: `products`,
      use_filename: true,
      unique_filename: false
    });

    // 4) Retorna ao bot o public_id + dados extraídos
    return res.json({
      publicId: upload.public_id,
      title:    title.trim(),
      oldPrice: oldPrice.replace(/\D/g, ''),  // só números
      price:    price.replace(/\D/g, ''),
    });
  } catch (err) {
    next(err);
  }
}

