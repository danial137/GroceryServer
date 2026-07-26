// get admin dashboard data

import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const getAdminState = async (req: Request, res: Response) => {
  const [
    totalOrders,
    totalUser,
    totalProduct,
    outOfStock,
    totalPartners,
    recentOrder,
  ] = await Promise.all([
    prisma.order.count({
      where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
    }),

    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.deliveryPartner.count(),
    prisma.order.findMany({
        where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
        orderBy: { createdAt: "desc" },
        take: 8,
        include:{user:{}}
    }),
  ]);
};
