import { prisma } from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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

    await prisma.$transaction(async (tx) => {
      await tx.orderProduct.deleteMany();
      await tx.cartItem.deleteMany();
      await tx.order.deleteMany();
      await tx.product.deleteMany();
      await tx.deliveryOption.deleteMany();

      await tx.product.createMany({
        data: products,
        skipDuplicates: true,
      });

      await tx.deliveryOption.createMany({
        data: deliveryOptions,
        skipDuplicates: true,
      });
    });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default { resetDatabase };
