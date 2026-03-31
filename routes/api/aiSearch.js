import express from 'express';
import aiSearchController from '../../controllers/aiSearchController.js';

const router = express.Router();

router.route('/').get(aiSearchController.aiSearch);

export default router;
