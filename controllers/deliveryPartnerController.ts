import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// Login delivery partner
// post /api/delivery/login

export const loginPartner = async (req: Request, res: Response) => {
  const { email, password } = req.body;

    if (!email || !password) {
      
        return res.status(400).json({message:"please provide email and pasword"})
    }
    const partner = await prisma.deliveryPartner.findUnique({
        where: {
        email:email.toLowerCase()
        }
    })
    
    if (!partner) {
        
    }
};
