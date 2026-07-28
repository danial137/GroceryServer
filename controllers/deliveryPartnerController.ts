import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (id: string) => {
  return jwt.sign({ id, role: "delivery" }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

// Login delivery partner
// post /api/delivery/login

export const loginPartner = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "please provide email and pasword" });
  }
  const partner = await prisma.deliveryPartner.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!partner) {
    return res.status(403).json({ message: "your account has been deactived" });
  }

  if (!partner.isActive) {
    return res.status(403).json({ message: "your account has been deactived" });
  }

  const isMatch = await bcrypt.compare(password, partner.password);
  if (!isMatch) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  const token = generateToken(partner.id);
  const { password: _, ...partnerData } = partner;
};

// get assigned delivery

// get /api/delivery/my-deliveries

export const getMyDelivery = async (req: Request, res: Response) => {
  const { status } = req.query;

  const where: any = { deliverypartnerId: req.partner!.id };

  if (status === "active") {
    where.status = { in: ["Assigned", "Packed", "Out for Delivery"] };
  } else if (status === "completed") {
    where.status = { in: ["Delivered", "Cancelled"] };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { user: { select: { name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({ orders });
};

// get single  delivery
// get /api/delivery/my-deliveries/:id

export const geDeliveryDetail = async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, deliveryPartnerId: req.partner!.id },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });

  if (!order) {
    return res.status(404).json({ message: "delivery not found" });
  }

  res.json({ order });
};

//complete delivery with otp
// put /api/delivery/my-deliveries/:id/complete

export const completeDelivery = async (req: Request, res: Response) => {
  const { otp } = req.body;

  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, deliveryPartnerId: req.partner!.id },
  });
};
