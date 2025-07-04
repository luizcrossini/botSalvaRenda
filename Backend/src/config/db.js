import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Carrega variáveis do .env automaticamente (procura na raiz do projeto)
dotenv.config({ debug: true });

// Construir URI de conexão (usa DB_URI se definido, senão monta manualmente)
const uri = process.env.DB_URI ||
  `mysql://${process.env.DB_USER}:${process.env.DB_PASS}` +
  `@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// console.log('🔗 Conectando ao MySQL com URI:', uri);

// Instancia o Sequelize
export const sequelize = new Sequelize(uri, {
  dialect: 'mysql',
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

// Testa conexão
sequelize.authenticate()
  .then(() => console.log('✓ Conectado ao MySQL'))
  .catch(err => console.error('✗ Falha ao conectar ao MySQL:', err));
