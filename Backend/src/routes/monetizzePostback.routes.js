import express from 'express';
import { handleMonetizzePostback } from '../controllers/monetizzePostback.controller.js';

const router = express.Router();

router.post('/', handleMonetizzePostback);

export default router;