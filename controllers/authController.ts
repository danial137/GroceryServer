import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt" 
import  jwt  from "jsonwebtoken";


// generate JWT token

const generateToken = (id:string) => {
    
    return jwt.sign({ id }, process.env.JWT_SECRET as string,{expiresIn: "30d"})

}

// chck if user  admin

const getAdminStatus = (email: string | null | undefined): boolean => {
    
    if (!email) return false

    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()) : []
    
    return adminEmails.includes(email.toLowerCase())

}
// Register

//POST/API/AUTH/REGISTER
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLwerCase() },
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User Already exist with this email" });
    }
    
    const hashedPasword = await bcrypt.hash(password, 10)
    
    const user = await prisma.user.create({
        data:{name,email:email.toLowerCase(), password:hashedPasword}
    })

    const token = generateToken(user.id)

    const userData: any = { ...user };
    delete userData.password

};
