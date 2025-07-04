// controllers/auth.controller.js
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import gerarToken from '../jwt.js';
import nodemailer from 'nodemailer';
import { sendWelcomeEmail} from '../services/emailService.js';


export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,      
  port: process.env.EMAIL_PORT,      
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


export const register = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email já cadastrado.' });

    const hashSenha = await bcrypt.hash(password, 10);
    const user = await User.create({ fullname, email, password: hashSenha });

    await sendWelcomeEmail(email, fullname);

    return res.status(201).json({ id: user.id, fullname, email });
  } catch (err) {
    console.error('Erro ao registrar:', err);
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send('Email é obrigatório');

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).send('Usuário não encontrado');

    const token = gerarToken(user.id);
    const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Recuperação de Senha - Salva Renda',
      html: `
        <h2>Recuperação de Senha</h2>
        <p>Olá ${user.fullname},</p>
        <p>Clique no botão abaixo para redefinir sua senha:</p>
        <a href="${resetLink}" style="background-color:#28a745;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Redefinir Senha</a>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.json({ message: 'E-mail enviado com sucesso!' });

  } catch (err) {
    console.error('Erro ao enviar e-mail de recuperação:', err);
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // ⚠️ Use "sub" no payload para funcionar com o middleware atual
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d' // pode ajustar
    });

    return res.json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).send('Token e nova senha são obrigatórios');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).send('Usuário não encontrado');

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();

    res.send('Senha redefinida com sucesso!');
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(400).send('Token inválido ou expirado');
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id','fullname','email']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json({ user });
  } catch (err) {
    next(err);
  }
};