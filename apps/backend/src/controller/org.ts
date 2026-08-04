import express, {type Request,type Response}from "express";
import {prisma} from "db/client";
import { createOrgSchema, UpdateOrgSchema } from "./../zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware";
import type { Membership } from "../../../../packages/db/generated/prisma/client";

const JWT_SECRET=process.env.JWT_SECRET||"";

const app = express();
app.use(express.json())



app.post(("/createOrg"),authMiddleware,async(req:Request, res:Response)=>{
    try{
        const {success,data,error}=createOrgSchema.safeParse(req.body);
         if(!success){
            return res.status(400).json({message:error.message})
        }
        const userId = req.userId;

        const {name,description}=data;

        const org = await prisma.org.create({
            data:{name, description}
        })

        await prisma.membership.create({
           data:{
            userId,
            orgId:org.id,
            role:"admin"
           }
        })
        
        return res.status(201).json({
            message:"organisation created successfully",
            data:{
                name,
                description
            }
        }) 
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
    
})

app.put(("/updateOrg"),authMiddleware,async(req:Request,res:Response)=>{
    try{
        const {success,data,error}=UpdateOrgSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({message:error.message})
        }
    
        const {id}=req.params;
        if(!id|| typeof id!== "string"){
            return res.status(400).json({message:"missing org id"})
        }
        const userId = req.userId;

        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId:id}}
        })

        const role = membership?.role;

        if(role  !== "admin"){
            return res.status(403).json({
                message:"not authorized to make changes"
            })
        }

        const {name,description}=data;

        await prisma.org.update({
            where:{id:id},
            data:{name,description}
        })
        return res.status(201).json({
            message:"Org Update Successfully",
            data:{name,description}
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"})
    }
    

})

app.get(("/organisation"),async(req:Request, res:Response)=>{
    
})