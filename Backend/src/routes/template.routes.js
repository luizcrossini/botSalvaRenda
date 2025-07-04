import { Router } from 'express';
import { jwtMiddleware } from '../middlewares/auth-jwt.js';
import { createTemplate, getLatestTemplate, createStory } from '../controllers/template.controller.js';


const router = Router();

router.post('/', jwtMiddleware, createTemplate);
router.get('/latest', jwtMiddleware, getLatestTemplate);
router.post('/story', jwtMiddleware, createStory);

export default router;
