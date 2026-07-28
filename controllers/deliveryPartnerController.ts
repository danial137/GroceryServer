import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { timeStamp } from "node:console";

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

export const getDeliveryDetail = async (req: Request, res: Response) => {
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

  if (!order || order.status === "Cancelled" || order.status === "Delivered") {
    return res.status(400).json({ messgae: "invalid Request" });
  }

  if (order.deliveryOtp !== otp) {
    return res.status(500).json({ message: "invalid otp" });
  }

  const history = order.statusHistory as any[];

  history.push({
    status: "delivered",
    note: "delivered by partner",
    timeStamp: new Date(),
  });

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "delivered", statusHistory: history, deliveryOtp: "" },
  });

  res.json({ order: updatedOrder, message: "delivery completed" });
};

export const cancelDelivery = async (req: Request, res: Response) => {
  const { reson } = req.body;

  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, deliveryPartnerId: req.partner!.id },
  });

  if (order!.status === "delivered") {
    return res.status(400).json({ message: "cannot cancel a delivered order" });
  }

  const history = order!.statusHistory as any[];

  history.push({
    status: "delivered",
    note: reson || "",
    timeStamp: new Date(),
  });
  const updatedOrder = await prisma.order.update({
    where: { id: order!.id },
    data: { status: "Cancelled", statusHistory: history },
  });

  res.json({ order: updatedOrder, message: "delivery cancelled" });
};

// upodate order status
// put /api/delivery/my-deliveries/:id/status

export const updatedDeliveryStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  const allowedStatuses = ["Packed", "Out for delivery"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "invalid status updated" });
  }

  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, deliveryPartnerId: req.partner!.id },
  });

  const history = order!.statusHistory as any[];

  history.push({
    status,
    note: `Status updated to ${status}`,
    timeStamp: new Date(),
  });

  const updatedOrder = await prisma.order.update({
    where: { id: order!.id },
    data: { status, statusHistory: history },
  });
  res.json({
    order: updatedOrder,
  });
};


// update live location

// put /api/delivery/my-deliveries/:id/location


export const updateLocation = async (req: Request, res: Response) => {

  const { lat, lng } = req.body;
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id as string,
      deliveryPartnerId: req.partner!.id,
      status:{in:['Assigned','packed', 'out for delivery']}
    }
  })
  await prisma.order.update({
    where: { id: order!.id },
    data:{liveLocation:{lat,lng,updatedAt:new Date()}}
  })

  res.json({success:true})
}