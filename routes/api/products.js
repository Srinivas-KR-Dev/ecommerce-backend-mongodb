import express from 'express'
import productsController from '../../controllers/productsController.js';

const router = express.Router()

router.route('/')
    .get(productsController.getAllProducts);

export default router;