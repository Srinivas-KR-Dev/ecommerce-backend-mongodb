import { prisma } from "../config/db.js"

const getAllProducts = async (req, res, next) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}

export default { getAllProducts } 