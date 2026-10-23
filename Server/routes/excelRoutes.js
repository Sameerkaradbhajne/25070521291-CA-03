import express from 'express';
import { downloadReport, syncReport, getStatus } from '../controllers/excelController.js';

const router = express.Router();

router.get('/download', downloadReport);
router.post('/sync', syncReport);
router.get('/status', getStatus);

export default router;
