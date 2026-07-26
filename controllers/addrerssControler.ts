import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// get user address
// get /api/address

export const getUserAddres = async (req: Request, res: Response) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "asc" },
  });
  res.json({ addresses });
};

//add adres
// post /api /adresses

export const addAdress = async (req: Request, res: Response) => {
  const { label, state, address, city, zip, isDefault, lat, lng } = req.body;

  if (lat == null || lng == null) {
    return res.json(400).json({
      message:
        "Location coordinates are required. please allow location access.",
    });
  }

  const currentAddresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
  });
  let makeDifault = isDefault;
  if (currentAddresses.length === 0) makeDifault = true;

  if (makeDifault) {
    await prisma.address.updateMany({
      where: { userId: req.user!.id },
      data: { isDefault: false },
    });
  }

  await prisma.address.create({
    data: {
      userId: req.user!.id,
      label,
      address,
      city,
      state,
      zip,
      isDefault: makeDifault,
      lat: Number(lat),
      lng: Number(lng),
    },
  });

  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "asc" },
  });

  res.status(201).json({ addAdress });
};

// update address
// put/api/addresses/:id

export const updateAddres = async (req: Request, res: Response) => {
  const { label, state, address, city, zip, isDefault, lat, lng } = req.body;

  if (lat == null || lng == null) {
    return res.json(400).json({
      message:
        "Location coordinates are required. please allow location access.",
    });
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user!.id },
      data: { isDefault: false },
    });
  }

  const data: any = {};
  if (label) data.label = label;
  if (address) data.label = label;
  if (city) data.city = city;
  if (state) data.state = state;
  if (zip) data.zip = zip;
  if (isDefault !== undefined) data.isDefault = isDefault;
  if (lat != null) data.lat = Number(lat);
    if (lng != null) data.lng = Number(lng);
    

    try {

        await prisma.address.update({
            where: { id: req.params.id as string },
            data,
        })
        
    } catch (error) {
        return res.status(404).json({mesage:"address not found"})
    }


    const addresses = await prisma.address.findMany({
        where: { userId: req.user!.id },
        orderBy:{createdAt:"asc"}
    })

    res.json({addresses})
};

export const deleteAddress = async (req: Request, res: Response)=>{
    
    try {

        await prisma.address.delete({where:{id:req.params.id as string}})
        
    } catch (err:any) {
        console.log(err.mesage)
    }


    const addresses = await prisma.address.findMany({
        where: { userId: req.user!.id },
        orderBy:{createdAt:"asc"}
    })

    res.json({addAdress})
}