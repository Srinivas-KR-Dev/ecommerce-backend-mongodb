import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import CartItem from '../models/CartItem.js';
import DeliveryOption from '../models/DeliveryOption.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resetDatabase = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const productsPath = path.join(__dirname, '..', 'data', 'products.json');
    const deliveryOptionsPath = path.join(
      __dirname,
      '..',
      'data',
      'deliveryOptions.json',
    );

    const products = JSON.parse(await fs.readFile(productsPath, 'utf-8'));
    const deliveryOptions = JSON.parse(
      await fs.readFile(deliveryOptionsPath, 'utf-8'),
    );

    await Promise.all([
      Order.deleteMany({}),
      CartItem.deleteMany({}),
      Product.deleteMany({}),
      DeliveryOption.deleteMany({}),
    ]);

    await Product.insertMany(products);
    await DeliveryOption.insertMany(deliveryOptions);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default { resetDatabase };
