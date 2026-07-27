import express from "express"
import auth from "../middleware/auth.js"
import admin from "../middleware/admin.js"
import { assignDeliveryPartner, createDeliveryPartner, getAdminState, getdeliveryPartners, updateDeliveryPartner } from "../controllers/adminController.js"


const adminRouter = express.Router()

adminRouter.get('/stats', auth, admin, getAdminState);
adminRouter.get('/delivery-partners', auth, admin, getdeliveryPartners);
adminRouter.post("/delivery-partners", auth, admin, createDeliveryPartner);
adminRouter.put("/delivery-partners", auth, admin, updateDeliveryPartner);
adminRouter.put("/orders/:id/assign", auth, admin, assignDeliveryPartner);

export default adminRouter
