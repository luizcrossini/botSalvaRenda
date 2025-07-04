// backend/src/middlewares/auth-jwt.js
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';



dotenv.config();

/**
 * Middleware JWT para proteger rotas.
 * Verifica se o header Authorization contém um Bearer token válido.
 * Se válido, adiciona req.userId e chama next(); senão retorna 401.
 */
export function jwtMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente ou malformado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
