import express from 'express';
import Assinatura from '../models/Assinatura.js';

const router = express.Router();

router.post('/perfectpay', async (req, res) => {
  try {
    const {
      usuario_id,
      cpf_cnpj,
      plano,
      nome,
      data_aprovacao,
      status
    } = req.body;

    if (!cpf_cnpj || !plano || !nome) {
      return res.status(400).json({ message: 'Dados obrigatórios ausentes.' });
    }

    const [assinatura, created] = await Assinatura.upsert({
      user_id: usuario_id || null,
      cpf: cpf_cnpj,
      codigo_plano: plano,
      nome_completo: nome,
      data_ultima_mensalidade: data_aprovacao || null,
      status_assinatura: status.toLowerCase()
    });

    res.status(200).json({ message: 'Webhook processado com sucesso.' });
  } catch (err) {
    console.error('Erro ao processar webhook:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});



export default router;
