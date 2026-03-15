import express from 'express';
import paymentSummaryController from '../../controllers/paymentSummaryController.js';

const router = express.Router();

router.route('/').get(paymentSummaryController.getPaymentSummary);

export default router;
