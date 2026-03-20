import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import DeliveryOption from '../models/DeliveryOption.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDeliveryOptions = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error('DATABASE_URI is missing in .env');
    }

    const filePath = path.join(__dirname, '..', 'data', 'deliveryOptions.json');
    const deliveryOptions = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    await mongoose.connect(process.env.DATABASE_URI);

    await DeliveryOption.deleteMany({});
    const inserted = await DeliveryOption.insertMany(deliveryOptions);

    console.log(`Seeded ${inserted.length} delivery options.`);
  } catch (error) {
    console.error('DeliveryOptions seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDeliveryOptions();
