import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

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
    
    res.json({ order })
    
    //Decrease stock

    for (const item of orderItems) {
        await prisma.product.update({
            where: { id: item.product },
            data:{stock:{decrement: item.quantity}}
        })
    }
};
