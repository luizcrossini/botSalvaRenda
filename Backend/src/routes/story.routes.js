import express from 'express';
import { jwtMiddleware } from '../middlewares/auth-jwt.js';
import { createStory} from '../controllers/story.controller.js';


const router = express.Router();
router.post('/',    jwtMiddleware, createStory);
export default router;
