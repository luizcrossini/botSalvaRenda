import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Assinatura = sequelize.define('assinaturas', {
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  nome_completo: DataTypes.STRING,
  email: DataTypes.STRING,
  cpf: DataTypes.STRING,
  telefone: DataTypes.STRING,
  cep: DataTypes.STRING,
  endereco: DataTypes.STRING,
  numero: DataTypes.STRING,
  complemento: DataTypes.STRING,
  bairro: DataTypes.STRING,
  cidade: DataTypes.STRING,
  estado: DataTypes.STRING,
  pais: DataTypes.STRING,
  codigo_plano: DataTypes.STRING,
  nome_plano: DataTypes.STRING,
  status_assinatura: DataTypes.STRING,
  data_inicio: DataTypes.DATE,
  data_fim: DataTypes.DATE,
  meio_pagamento: DataTypes.STRING,
  forma_pagamento: DataTypes.STRING,
  valor: DataTypes.STRING,
  valor_recebido: DataTypes.STRING,
  quantidade: DataTypes.STRING,
  parcelas: DataTypes.STRING,
  codigo_venda: DataTypes.STRING,
  chave_unica: DataTypes.STRING,
}, {
  timestamps: false
});

export default Assinatura;