import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedProducts = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error("DATABASE_URI is missing in .env");
    }

    const productsPath = path.join(__dirname, "..", "data", "products.json");
    const products = JSON.parse(await fs.readFile(productsPath, "utf-8"));

    await mongoose.connect(process.env.DATABASE_URI);

    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(products);

    console.log(`Seeded ${insertedProducts.length} products.`);
  } catch (error) {
    console.error("Product seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts();
