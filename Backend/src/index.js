import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './config/db.js';
import authRoutes     from './routes/auth.routes.js';
import productRoutes  from './routes/product.routes.js';
import templateRoutes from './routes/template.routes.js';
import bodyParser from 'body-parser';
import webhookRoutes from './routes/webhook.routes.js';
import assinaturaRoutes from './routes/assinatura.routes.js';
import postbackRoutes from './routes/monetizzePostback.routes.js';

const app = express();
app.use(cors({
  origin: 'https://luizrossini.com.br',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/auth',     authRoutes);
app.use('/products', productRoutes);
app.use('/templates',templateRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api', assinaturaRoutes);
app.use('/postback', postbackRoutes);


const PORT= process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const frontendPath = path.join(__dirname, '../../frontend/public');
// app.use(express.static(path.join(frontendPath)));


app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Rodando em http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Falha ao sincronizar DB:', err);
    process.exit(1);
  });

  