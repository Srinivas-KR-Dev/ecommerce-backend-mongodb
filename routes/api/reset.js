import express from 'express';
import resetController from '../../controllers/resetController.js';

const router = express.Router();

router.route('/').post(resetController.resetDatabase);

export default router;
