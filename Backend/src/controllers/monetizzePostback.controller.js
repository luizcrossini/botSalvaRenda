import  {sequelize}  from '../config/db.js';


export async function handleMonetizzePostback(req, res) {
  const data = req.body;

  const userId = data?.venda?.src;
  if (!userId) {
    return res.status(400).json({ error: 'user_id (venda.src) não encontrado no postback.' });
  }

  const assinatura = {
    user_id: userId,
    nome_completo: data?.comprador?.nome || null,
    email: data?.comprador?.email || null,
    cpf: data?.comprador?.cnpj_cpf || null,
    telefone: data?.comprador?.telefone || null,
    cep: data?.comprador?.cep || null,
    endereco: data?.comprador?.endereco || null,
    numero: data?.comprador?.numero || null,
    complemento: data?.comprador?.complemento || null,
    bairro: data?.comprador?.bairro || null,
    cidade: data?.comprador?.cidade || null,
    estado: data?.comprador?.estado || null,
    pais: data?.comprador?.pais || null,
    codigo_plano: data?.plano?.referencia || null,
    nome_plano: data?.plano?.nome || null,
    status_assinatura: data?.assinatura?.status || data?.venda?.status || null,
    data_inicio: data?.venda?.dataInicio || null,
    data_fim: data?.venda?.dataFinalizada || null,
    meio_pagamento: data?.venda?.meioPagamento || null,
    forma_pagamento: data?.venda?.formaPagamento || null,
    valor: data?.venda?.valor || null,
    valor_recebido: data?.venda?.valorRecebido || null,
    quantidade: data?.venda?.quantidade || null,
    parcelas: data?.venda?.parcelas || null,
    codigo_venda: data?.venda?.codigo || null,
    chave_unica: data?.chave_unica || null
  };

  try {
    // Verifica se o user_id existe na tabela users (respeitando FK)
    const [userRows] = await sequelize.query('SELECT id FROM users WHERE id = ?', {
      replacements: [userId]
    });

    if (userRows.length === 0) {
      return res.status(400).json({ error: 'Usuário não encontrado na tabela users (FK).' });
    }

    // Monta query dinâmica para insert/update
    const columns = Object.keys(assinatura).join(', ');
    const placeholders = Object.keys(assinatura).map(() => '?').join(', ');
    const updates = Object.keys(assinatura)
      .filter(key => key !== 'user_id')
      .map(key => `${key} = VALUES(${key})`)
      .join(', ');

    const sql = `
      INSERT INTO assinaturas (${columns})
      VALUES (${placeholders})
      ON DUPLICATE KEY UPDATE ${updates}
    `;

    await sequelize.query(sql, {
      replacements: Object.values(assinatura)
    });

    console.log(`✅ Assinatura inserida/atualizada para user_id: ${userId}`);
    return res.status(200).json({ message: 'Assinatura salva com sucesso.' });
  } catch (error) {
    console.error('❌ Erro ao salvar assinatura:', error);
    return res.status(500).json({ error: 'Erro interno ao salvar assinatura.' });
  }
}