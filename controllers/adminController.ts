// get admin dashbo""ard data
import bcrypt from "bcrypt";
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
      include: {
        user: { select: { name: true, email: true } },

        deliveryPartner: { select: { name: true, phone: true } },
      },
    }),
  ]);

  res.json({
    totalOrders,
    totalUser,
    totalProduct,
    outOfStock,
    totalPartners,
    recentOrder,
  });
};

// get delivery partner list for admin

export const getdeliveryPartners = async (req: Request, res: Response) => {
  const partners = await prisma.deliveryPartner.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json({ partners });
};

// create delivery partners

export const createDeliveryPartner = async (req: Request, res: Response) => {
  const { name, email, password, phone, vehicleType } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400).json({ message: "PLease provide all required fields" });

    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const partner = await prisma.deliveryPartner.create({
    data: { name,email: email.toLowerCase(), password, phone, vehicleType },
  });
};
