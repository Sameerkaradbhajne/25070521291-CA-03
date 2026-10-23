import express from 'express';
import { getWorkshops, registerWorkshop } from '../controllers/workshopController.js';

const router = express.Router();

router.get('/', getWorkshops);
router.post('/register', registerWorkshop);

export default router;
