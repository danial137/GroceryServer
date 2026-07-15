import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ message: "No token provided authorization denied" });
      }
      
      const token = authHeader.split("")[1]


      const decoded = jwt.verify


  } catch (error) {}
};
