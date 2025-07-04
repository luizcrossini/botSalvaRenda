// bot.js
import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { checkLinkOrigin } from './utils/extractLinkInfo.js';
import { getProductInfo } from './utils/getProductInfo.js';
import { generateStoryImage } from './utils/generateStory.js';
import { v4 as uuidv4 } from 'uuid';
import { downloadImage } from './utils/downloadImageAndLoad.js';
import { formatMensagem } from './utils/formatMensagem.js';


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializa bot e sessão
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(new LocalSession({ database: 'session_db.json' }).middleware());

// Conexão com MySQL
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS
});

// Comandos básicos
bot.start(async (ctx) => {
  ctx.session ??= {};
  const telegramId = ctx.from.id;
  const [rows] = await db.execute('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
  if (rows.length === 0) {
    ctx.reply('🔒 Você não está logado. Use /login para iniciar o processo.');
  } else {
    ctx.session.user = rows[0];
    ctx.reply('✅ Logado! Use /story, /post ou /storypost para definir o modo.');
  }
});

bot.command('login', (ctx) => {
  ctx.session ??= {};
  ctx.session.loginStep = 'email';
  ctx.reply('📧 Por favor, informe seu e-mail:');
});

bot.command('story', (ctx) => {
  ctx.session ??= {};
  ctx.session.modo = 'story';
  ctx.reply('📸 Modo: somente story. Envie o link.');
});

bot.command('post', (ctx) => {
  ctx.session ??= {};
  ctx.session.modo = 'post_story';
  ctx.reply('📝 Modo: post e story. Envie o link.');
});

bot.command('storypost', (ctx) => {
  ctx.session ??= {};
  ctx.session.modo = 'post_story';
  ctx.reply('📸📝 Modo: story e post ativado. Envie o link do produto.');
});

bot.command('template', (ctx) => {
  ctx.session ??= {};
  ctx.session.awaitingTemplate = true;
  ctx.session.userId = ctx.session.user?.id;
  ctx.reply('📎 Envie agora o seu template (imagem PNG ou JPG). Em formato de *Documento*');
});

bot.command('mensagem', (ctx) => {
  ctx.session ??= {};
  ctx.session.awaitingMensagem = true;
  ctx.reply('📝 Envie agora a nova mensagem que será usada nos posts.');
});

bot.command('mensagem_atual', async (ctx) => {
  const userId = ctx.session?.user?.id;
  if (!userId) return ctx.reply('⚠️ Você precisa estar logado.');
  const [row] = await db.execute('SELECT mensagem_post FROM users WHERE id = ?', [userId]);
  const mensagemAtual = row[0]?.mensagem_post;
  ctx.reply(mensagemAtual ? `📌 Mensagem atual:\n\n${mensagemAtual}` : '📌 Nenhuma mensagem personalizada cadastrada.');
});

bot.command('mensagem_resetar', async (ctx) => {
  const userId = ctx.session?.user?.id;
  if (!userId) return ctx.reply('⚠️ Você precisa estar logado.');
  await db.execute('UPDATE users SET mensagem_post = NULL WHERE id = ?', [userId]);
  ctx.reply('♻️ Mensagem personalizada removida. Agora será usada a mensagem padrão automática.');
});

// Recebe mensagens de texto
bot.on('text', async (ctx) => {
  ctx.session ??= {};
  const userLink = ctx.message.text.trim(); // link enviado
  const msg = ctx.message.text?.trim();
  if (msg.startsWith('/')) return;

  if (ctx.session.awaitingMensagem) {
    const userId = ctx.session.user?.id;
    if (!userId) return ctx.reply('⚠️ Você precisa estar logado.');
    await db.execute('UPDATE users SET mensagem_post = ? WHERE id = ?', [msg, userId]);
    delete ctx.session.awaitingMensagem;
    return ctx.reply('✅ Mensagem atualizada com sucesso!\nℹ️ Agora use /story, /post ou /storypost para continuar.');
  }

  if (ctx.session.loginStep === 'email') {
    ctx.session.loginEmail = msg;
    ctx.session.loginStep = 'senha';
    return ctx.reply('🔒 Agora informe sua senha:');
  }

  if (ctx.session.loginStep === 'senha') {
    const email = ctx.session.loginEmail;
    const senha = msg;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0 || !(await bcrypt.compare(senha, rows[0].password))) {
      ctx.session.loginStep = null;
      return ctx.reply('❌ Email ou senha incorretos. Use /login novamente.');
    }
    ctx.session.user = rows[0];
    ctx.session.loginStep = null;
    return ctx.reply('✅ Login realizado com sucesso! Use /story, /post ou /storypost para continuar.');
  }

  if (!ctx.session.user) return ctx.reply('⚠️ Use /login primeiro.');
  const userId = ctx.session.user.id;
  const modo = ctx.session.modo;
  if (!modo) return ctx.reply('⚠️ Use /story, /post ou /storypost para definir o modo.');

  const origem = checkLinkOrigin(msg);
  if (!origem) return ctx.reply('❌ Link não reconhecido.');

  ctx.reply('🔄 Extraindo dados do produto...');
  let productData;
  try {
    productData = await getProductInfo(msg, origem);
  } catch (err) {
    console.error('Erro ao extrair produto:', err);
    return ctx.reply('❌ Ocorreu um erro ao buscar os dados do produto.');
  }

  if (!productData || !productData.image) {
    return ctx.reply('❌ Produto não encontrado ou erro na extração.');
  }

  const [templateRows] = await db.execute('SELECT path FROM templates WHERE user_id = ? AND tipo = ?', [userId, 'story']);
  const templateFileName = templateRows[0]?.path;
  if (!templateFileName) return ctx.reply('⚠️ Envie um template primeiro com /template.');

  const templateFullPath = path.join(__dirname, 'templates', templateFileName);
  if (!fs.existsSync(templateFullPath)) {
    console.error('❌ Template não encontrado no disco:', templateFullPath);
    return ctx.reply('❌ Template não encontrado no disco. Envie novamente com /template.');
  }

  const outputPath = path.join(__dirname, 'output', `${Date.now()}-${userId}.png`);
  ctx.reply('🧵 Criando seu story... Aguarde um instante.');
console.log('➡️ Enviando para generateStoryImage:', {
  title: productData.title,
  price: productData.price,
  image: productData.image
});
  const finalImage = await generateStoryImage({
  title: productData.title, // 👈 Corrigido
  price: productData.price, // 👈 Corrigido
  image: productData.image,
  templatePath: templateFullPath,
  outputPath: outputPath
});
const imagePath = await downloadImage(productData.image);
 await ctx.replyWithPhoto({ source: finalImage });

  if (modo === 'post_story') {
    const [userRow] = await db.execute('SELECT mensagem_post FROM users WHERE id = ?', [userId]);
    const mensagemUser = userRow[0]?.mensagem_post;
const mensagemFinal = formatMensagem(mensagemUser, {
  title: productData.title,
  price: productData.price,
  link: userLink
});

// Envia a mensagem formatada
await ctx.reply(mensagemFinal);
  }
});

// Upload de template
bot.on('photo', async (ctx) => {
  if (!ctx.session.awaitingTemplate || !ctx.session.userId) return;

  const file = ctx.message.photo[ctx.message.photo.length - 1];
  const fileLink = await ctx.telegram.getFileLink(file.file_id);
  const templatesDir = path.join(__dirname, 'templates');
  if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir);

  const filename = `${uuidv4()}.png`;
  const filePath = path.join(templatesDir, filename);
  const writer = fs.createWriteStream(filePath);

  const response = await axios.get(fileLink.href, { responseType: 'stream' });
  response.data.pipe(writer);

  writer.on('finish', async () => {
    try {
      await db.execute(
        'REPLACE INTO templates (user_id, path, tipo) VALUES (?, ?, ?)',
        [ctx.session.userId, filename, 'story']
      );
      delete ctx.session.awaitingTemplate;
      ctx.reply('✅ Template salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar no banco:', err);
      ctx.reply('❌ Erro ao salvar template no banco.');
    }
  });

  writer.on('error', (err) => {
    console.error('Erro ao salvar localmente:', err);
    ctx.reply('❌ Erro ao salvar template no servidor.');
  });
});

bot.launch();
