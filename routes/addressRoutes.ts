import express from "express"
import auth from "../middleware/auth.js"
import { addAdress, deleteAddress, getUserAddres, updateAddres } from "../controllers/addrerssControler.js"

const addressRouter = express.Router()

addressRouter.get('/', auth, getUserAddres)
addressRouter.post("/", auth, addAdress);
addressRouter.put("/:id", auth, updateAddres);
addressRouter.delete("/:id", auth, deleteAddress);


export default addressRouter

