import { Router } from 'express';
import { getProductInfo } from '../controllers/product.controller.js';
import { jwtMiddleware } from '../middlewares/auth-jwt.js';

const router = Router();
router.post(
    '/info',       // <- URL: /products/info
    jwtMiddleware, (req, res, next)=> {
      console.log('Recebi /products/info',{
        method: req.method,
        body: req.body
      });
      next();

    },
    getProductInfo
  );
export default router;
