import express from 'express'
import cartItemsController from '../../controllers/cartItemsController.js'

const router = express.Router();

router.route('/')
    .get(cartItemsController.getAllCartItems)
    .post(cartItemsController.createCartItem);

router.route('/:productId')
    .put(cartItemsController.updateCartItem)
    .delete(cartItemsController.deleteCartItem)


export default router;