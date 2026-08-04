import express, {type Request,type Response}from "express";
import {prisma} from "db/client";
import { createOrgSchema, UpdateOrgSchema } from "./../zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware";
import type { Membership } from "../../../../packages/db/generated/prisma/client";


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
    
});

app.put(("/updateOrg/:id"),authMiddleware,async(req:Request,res:Response)=>{
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
        return res.status(200).json({
            message:"Org Update Successfully",
            data:{name,description}
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"})
    }
    

});

app.get(("/organisation/:orgId"),authMiddleware,async(req:Request, res:Response)=>{
    try{
        const {orgId} = req.params;

        if(!orgId || typeof orgId !== "string"){
            return res.status(400).json({message:"missing org id"});
        }
    
        const userId = req.userId;
    
        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId}}
        });
    
        if(!membership){
            return res.status(403).json({message:"not authorized to view this org"})
        }
    
    
        const org = await prisma.org.findFirst({
            where:{id:orgId},
            select:{
                name:true,
                description:true
            }
        });

        if(!org){
            return res.status(404).json({message:"org not found"})
        }

        return res.status(200).json({
            message:"org fetch successfully",
            data:org
        })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
});

app.delete("/deleteOrg/:orgId",authMiddleware,async(req:Request, res:Response)=>{
    try{
        const {orgId}= req.params;
        if(!orgId || typeof orgId !== "string"){
            return res.status(400).json({message:"missing org id"})
        }

        const userId = req.userId;

        const memebership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId}}
        });

        const role = memebership?.role;
        if(role !== "admin"){
            return res.status(403).json({message:"you are not authorized to delete this org"})
        }

        const org = await prisma.org.findUnique({
            where:{id:orgId}
        });

        if(!org){
            return res.status(404).json({message:"org not found"});
        }

        await prisma.org.delete({
            where:{id:orgId}
        })

        return res.status(200).json({message:"org delete successfully"})
    }
    catch(error){
        return res.status(500).json({message:"internal server error"});
    }
})
    
    