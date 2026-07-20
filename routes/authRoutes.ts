import express from "express"
import { login, register,testEmail } from "../controllers/authController.js"

const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post("/login", login)
authRouter.get("/test-email", testEmail);

export default authRouter

