import express from 'express';
import ordersController from '../../controllers/ordersController.js';

const router = express.Router();

router
  .route('/')
  .get(ordersController.getAllOrders)
  .post(ordersController.createOrder);

router.route('/:orderId').get(ordersController.getOrderById);

export default router;
