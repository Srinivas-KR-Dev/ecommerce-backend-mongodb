import express from 'express';
import aiAssistantController from '../../controllers/aiAssistantController.js';

const router = express.Router();

router.route('/').post(aiAssistantController.aiAssistant);

export default router;
