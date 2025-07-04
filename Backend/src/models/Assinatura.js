import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Assinatura = sequelize.define('assinaturas', {
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'user_id'
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true  // 🔑 Aqui informamos ao Sequelize que CPF é a PK
  },
  codigo_plano: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nome_completo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data_ultima_mensalidade: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status_assinatura: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'assinaturas',
  timestamps: false
});

export default Assinatura;
