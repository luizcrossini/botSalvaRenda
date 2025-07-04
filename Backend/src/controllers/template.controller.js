// backend/src/controllers/template.controller.js
import { Template } from '../models/Template.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:    process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Cria um novo template (recebe imageUrl, envia ao Cloudinary e armazena publicId)
export async function createTemplate(req, res, next) {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'O campo imageUrl é obrigatório.' });

    // Faz upload para Cloudinary
    const upload = await cloudinary.uploader.upload(imageUrl, { folder: 'story_templates' });

    // Salva no banco
    const tpl = await Template.create({
      userId: req.userId,
      imageUrl: upload.secure_url,
      publicId: upload.public_id
    });

    return res.json({ publicId: tpl.publicId, imageUrl: tpl.imageUrl });
  } catch (err) {
    next(err);
  }
}

// Retorna o último template cadastrado pelo usuário
export async function getLatestTemplate(req, res, next) {
  try {
    const tpl = await Template.findOne({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    if (!tpl) return res.status(404).json({ error: 'Template não encontrado.' });
    return res.json({ publicId: tpl.publicId, imageUrl: tpl.imageUrl });
  } catch (err) {
    next(err);
  }
}

// Gera um story a partir do template e dados do produto
export async function createStory(req, res, next) {
  try {
    const { templateId, product } = req.body;
    if (!templateId || !product) {
      return res.status(400).json({ error: 'templateId e product são obrigatórios.' });
    }

    // Busca template no DB
    const tpl = await Template.findOne({ where: { publicId: templateId, userId: req.userId } });
    if (!tpl) return res.status(404).json({ error: 'Template não encontrado.' });

    // Monta transformações Cloudinary para overlay do produto e texto
    const transformations = [
      { width: 800, height: 1280, crop: 'fill' },
      // overlay da imagem do produto
      { overlay: { public_id: product.publicId }, width: 600, height: 600, crop: 'fit', gravity: 'north' },
      // overlay do nome do produto
      { overlay: { font_family: 'Arial', font_size: 48, text: product.title }, gravity: 'south_west', x: 20, y: 200 },
      // overlay do preço atual
      { overlay: { font_family: 'Arial', font_size: 64, text: `R$ ${product.price}` }, gravity: 'south_west', x: 20, y: 100 }
    ];

    // Gera URL do story
    const storyUrl = cloudinary.url(tpl.publicId, {
      transformation: transformations
    });

    return res.json({ storyUrl });
  } catch (err) {
    next(err);
  }
}
