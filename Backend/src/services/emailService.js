// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify()
  .then(() => console.log('✅ Titan SMTP conectado com sucesso!'))
  .catch(err => console.error('❌ Erro no Titan SMTP:', err));


export async function sendWelcomeEmail(to, name) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Bem-vindo ao Salva Renda!',
    html: `
       <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #4CAF50;">🎉 Seja bem-vindo(a) ao nosso sistema!</h2>
    <p>Olá <strong>${name}</strong>,</p>
    <p>Seu cadastro foi realizado com sucesso!</p>
    <p>Agora você já pode acessar o sistema usando seu e-mail de acesso que é <strong>${to}</strong></p>
    <p>Estamos felizes em ter você conosco!</p>
    <br />
    <p style="font-size: 12px; color: #888;">Este é um e-mail automático. Não responda.</p>
  </div>
`})}

export async function sendPasswordResetEmail(to, resetLink) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Recuperação de Senha - Salva Renda',
    html: `
       <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
  <h2 style="color: #FF5722;">🔐 Recuperação de Senha</h2>
  <p>Olá <strong>${name}</strong>,</p>
  <p>Recebemos uma solicitação para redefinir sua senha.</p>
  <p>Clique no botão abaixo para criar uma nova senha:</p>
  <p>
    <a href="${link}" style="display: inline-block; background-color: #FF5722; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
      Redefinir Senha
    </a>
  </p>
  <p>Se não foi você quem solicitou, ignore este e-mail.</p>
  <br />
  <p style="font-size: 12px; color: #888;">Este é um e-mail automático. Não responda.</p>
</div>
    `
  });
}