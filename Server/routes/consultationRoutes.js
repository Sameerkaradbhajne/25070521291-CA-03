import express from 'express';
import { bookConsultation, getConsultations } from '../controllers/consultationController.js';

const router = express.Router();

router.route('/')
    .post(bookConsultation)
    .get(getConsultations);

export default router;
