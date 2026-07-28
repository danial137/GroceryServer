import expres from "express";
import {
  cancelDelivery,
  completeDelivery,
  getDeliveryDetail,
  getMyDelivery,
  loginPartner,
  updatedDeliveryStatus,
  updateLocation,
} from "../controllers/deliveryPartnerController.js";
import deliveryAuth from "../middleware/deliveyAuth.js";

const deliveryPartnerRouter = expres.Router();

deliveryPartnerRouter.post("/login", loginPartner);
deliveryPartnerRouter.get("/my-deliveries", deliveryAuth, getMyDelivery);
deliveryPartnerRouter.get(
  "/my-deliveries/:id",
  deliveryAuth,
  getDeliveryDetail,
);
deliveryPartnerRouter.put(
  "/my-deliveries/:id/complete",
  deliveryAuth,
  completeDelivery,
);
deliveryPartnerRouter.put(
  "/my-deliveries/:id/cancel",
  deliveryAuth,
  cancelDelivery,
);
deliveryPartnerRouter.put(
  "/my-deliveries/:id/status",
  deliveryAuth,
  updatedDeliveryStatus,
);
deliveryPartnerRouter.put(
  "/my-deliveries/:id/location",
  deliveryAuth,
  updateLocation,
);
export default deliveryPartnerRouter;
