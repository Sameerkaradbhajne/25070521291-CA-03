import express from 'express';
import { downloadReport, syncReport, getStatus } from '../controllers/excelController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/download', protect, admin, downloadReport);
router.post('/sync', protect, admin, syncReport);
router.get('/status', protect, admin, getStatus);

export default router;
