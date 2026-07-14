import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// GET /api/product/flash-deals
export const getFlashDeals = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    orderBy: { originalPrice: "desc" },
  });

  const productsWithDiscount = products.map((p: any) => {
    const discount =
      p.originalPrice && p.price
        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
        : 0;
    return { ...p, discount };
  });
    res.json({products:productsWithDiscount.slice(0,8)})
};

//GET /api / prodcuts

export const getProducts = async (req: Request, res: Response) => {
    
}
