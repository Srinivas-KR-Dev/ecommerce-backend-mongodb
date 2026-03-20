import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import CartItem from '../models/CartItem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedCartItems = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error('DATABASE_URI is missing in .env');
    }

    const filePath = path.join(__dirname, '..', 'data', 'cart.json');
    const cartItems = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    await mongoose.connect(process.env.DATABASE_URI);

    await CartItem.deleteMany({});
    const inserted = await CartItem.insertMany(cartItems);

    console.log(`Seeded ${inserted.length} cart items.`);
  } catch (error) {
    console.error('CartItems seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedCartItems();
