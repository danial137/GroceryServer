import { Inngest } from "inngest";
import { prisma } from "../config/prisma.js";

const LOW_STOCK_THRESHOLD = 10;

// Create a client to send and receive events
export const inngest = new Inngest({ id: "grocery-store-delivery" });

// Low stack Alert to admin

const helloWorld = inngest.createFunction(
  {
    id: "check-low-stock",
    name: "Low Stack Alert",
    triggers: [{ event: "inventory/stack.updated" }],
  },
  async ({ event, step }) => {
    const { productId } = event.data;

    const product = await step.run("fetch-product", async () => {
      return await prisma.product.findUnique({ where: { id: productId } });
    });

    if (
      !product ||
      product.stock === null ||
      product.stock >= LOW_STOCK_THRESHOLD
    ) {
      return { skipped: true, stock: product?.stock };
    }

    await step.run("send-low-stock-email", async () => {
      const adminEmials = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim())
        : [];

      if (adminEmials.length === 0)
        return { skipped: true, reason: "No admin emails" };
    });
  },
);

// Create an empty array where we'll export future Inngest functions
export const functions = [];
