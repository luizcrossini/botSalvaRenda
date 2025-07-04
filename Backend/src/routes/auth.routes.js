import express from 'express';
import { register, login, resetPassword, me} from '../controllers/auth.controller.js';
import { jwtMiddleware } from '../middlewares/auth-jwt.js';
import { forgotPassword } from '../controllers/auth.controller.js';

const router = express.Router();
// Rota de cadastro
router.post('/register', register);
// Rota de login tradicional
router.post('/login',    login);
// Rota para obter os dados do usuário autenticado
router.post('/recover', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', jwtMiddleware, me); 

export default router;