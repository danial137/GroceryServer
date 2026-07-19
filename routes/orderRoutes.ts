import express from "express";
import auth from "../middleware/auth.js";
import {
  createOrder,
  getAllOrders,
  getOrder,
  getOrderLocation,
  getUserOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import admin from "../middleware/admin.js";

const orderRoutes = express.Router();

orderRoutes.post("/", auth, createOrder);
orderRoutes.get("/", auth, getUserOrder);
orderRoutes.get("/all", auth, admin, getAllOrders);
orderRoutes.get("/:id", auth, getOrder);
orderRoutes.put("/:id/status", auth, admin, updateOrderStatus);
orderRoutes.get("/id:location", auth, getOrderLocation);

export default orderRoutes;
