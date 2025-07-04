// src/routes/assinatura.routes.js
import express from 'express';
import Assinatura from '../models/Assinatura.js';

const router = express.Router();

router.get('/assinatura-status/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('📥 Recebido ID:', userId);

    const assinatura = await Assinatura.findOne({
      where: { user_id: userId }
    });

    if (!assinatura) {
      console.log('⚠️ Assinatura não encontrada para o ID:', userId);
      return res.status(404).json({ status_assinatura: 'nenhuma' });
    }

    console.log('✅ Assinatura encontrada:', assinatura.status_assinatura);
    res.json({ status_assinatura: assinatura.status_assinatura });

  } catch (err) {
    console.error('❌ Erro ao consultar assinatura:', err.message);
    res.status(500).json({ error: 'Erro ao verificar assinatura' });
  }
});

export default router;
