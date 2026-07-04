import express from 'express';
import { processPayment, downloadReceipt } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, processPayment);
router.get('/receipt/:id', protect, downloadReceipt);

export default router;
