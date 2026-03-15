import express from 'express'
import deliveryOptionsController from '../../controllers/deliveryOptionsController.js'

const router = express.Router();

router.route('/')
    .get(deliveryOptionsController.getAllDeliveryOptions);

export default router;