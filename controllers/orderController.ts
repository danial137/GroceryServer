import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { timeStamp } from "node:console";
import { inngest } from "../inngest/index.js";

// create order
// post /api/order

export const createOrder = async (req: Request, res: Response) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  // check if order items are empty

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  // look up actual price from the database

  const productId = items.map((i: any) => i.products);
  const products = await prisma.product.findMany({
    where: { id: { in: productId } },
  });

  const productMap: Record<string, (typeof products)[0]> = {};

  products.forEach((p: any) => (productMap[p.id] = p));

  //check if product is in stock

  for (const item of items) {
    const product = productMap[item.product];
    if (!product || (product.stock ?? 0) < item.quantity) {
      return res.status(400).json({ message: "product out of stock" });
    }
  }

  const orderItems = items.map((item: any) => {
    const dbProduct = productMap[item.product];
    if (!dbProduct) throw new Error(`product ${item.product} not found`);

    return {
      product: dbProduct.id,
      name: dbProduct.name,
      image: dbProduct.image,
      price: dbProduct.price,
      quantity: item.quantity,
      unit: dbProduct.unit,
    };
  });

  const subtotal = orderItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0,
  );

  const deliveryFee = subtotal > 20 ? 0 : 1.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
      total,
      statusHistory: [
        {
          status: "places",
          note: "Order places successfully",
          timestamp: new Date(),
        },
      ],
    },
  });

  if (paymentMethod === "card") {
    // stripe payment link
  }

  res.json({ order });

  //Decrease stock

  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.product },
      data: { stock: { decrement: item.quantity } },
    });
  }
  // send stock update events for each product in the order
  for (const item of orderItems) {
    await inngest.send({name: "inventory/stock.updated", data:{productId:item.product}})
  }

  await inngest.send({ name: "order/placed", data: { orderId: order.id } })

  

};

// get user order
// get /api/orders

export const getUserOrder = async (req: Request, res: Response) => {
  const { status } = req.body;

  const where: any = {
    userId: req.user!.id,
    NO: [{ paymentMethod: "card", isPaid: false }],
  };

  if (status && status !== "all") {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: { deliveryPartner: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({ orders });
};

// GET single order
// GET /api/orders/:id

export const getOrder = async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, userId: req.user!.id },
    include: {
      deliveryPartner: {
        select: { name: true, phone: true, avatar: true, vehicleType: true },
      },
    },
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json({ order });
};

// UPdate order status (Admin)
// PUT / api/orders/:id/status

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status, note } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: req.params.id as string },
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const history = (
    Array.isArray(order.statusHistory) ? order.statusHistory : []
  ) as any[];
  history.push({
    status,
    not: note || `Order ${status.toLowerCase()}`,
    timeStamp: new Date(),
  });

  const updatedOrder = await prisma.order.update({
    where: { id: req.params.id as string },
    data: { status, statusHistory: history },
  });
  res.json({ order: updatedOrder });
};

// get all orders (admin)
// get /api/orders/all

export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
    include: {
      user: { select: { name: true, email: true } },
      deliveryPartner: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ orders });
};

// get order location
// get /api/orders/:id/location

export const getOrderLocation = async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, userId: req.user!.id },
    select: {liveLocation:true, status:true}
  });

  if (!order) return res.status(404).json({ message: "order not found" })
  
  res.json({livelocation:order.liveLocation, status: order.status})

};
