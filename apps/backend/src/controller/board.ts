import express,{type Request, type Response} from "express";
import {prisma} from "db/client";
import {z} from "zod";
import { authMiddleware } from "../middleware";
import { BoardSchema, UpdateBoardSchema } from "../zod";

const app = express();
app.use(express.json());

const createBoard =async(req:Request,res:Response)=>{
    try{
        const {success,data,error} = BoardSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({message:error.message})
        }
        const userId = req.userId;

        const {title,orgId}=data;
        const board = await prisma.board.create({
            data:{title,orgId}
        })

        return res.status(200).json({
            message:"board created successfully",
            data:board
        })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
};
app.post (("/CreateBoard"),authMiddleware,createBoard);


const UpdateBoard=async(req:Request,res:Response)=>{
    try{
        const {success,data,error}=UpdateBoardSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({message:error.message});
        }
        const {id} = req.params;
        if(!id || typeof id !== "string"){
            return res.status(400).json({message:"missing board id"})
        }

        const userId = req.userId;
        const board = await prisma.board.findUnique({
            where:{id},
            select:{orgId:true}
        });
        if(!board){
            return res.status(404).json({message:"board not found"})
        }

        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId:board.orgId}}
        })

        const role = membership?.role;
        if(role !=="admin"){
            return res.status(403).json({message:"not authorized to make changes"})
        }

        const {title}=data;
        const UpdateBoard = await prisma.board.update({
            where:{id:id},
            data:{title}
        })
        return res.status(200).json({
            message:"board updated successfully",
            data:UpdateBoard
        })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }

};
app.put(("/UpdateBoard/:id"),authMiddleware,UpdateBoard);


const getBoard = async(req:Request,res:Response)=>{
    try{
        const {id}= req.params;
        if(!id || typeof id !=="string"){
            return res.status(400).json({message:"missing board id"});
        }
        const userId = req.userId;
        const board = await prisma.board.findUnique({
            where:{id},
            select:{
                title:true,
                orgId:true
            }
        })
        if(!board){
            return res.status(404).json({message:"board not found "})
        }
        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId:board.orgId}}
        })
         
         if(!membership){
            return res.status(403).json({message:"not authorized to view "})
         }
         return res.status(200).json({
            message:"board fetch successfully",
            data:{id,title:board.title}
        })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }

};
app.get(("/Board/:id"),authMiddleware,getBoard);


const deleteBoard = async(req:Request,res:Response)=>{
    try{
        const {id} = req.params;
        if(!id || typeof id !=="string"){
            return res.status(400).json({message:"missing board id"});
        }
        const userId = req.userId;
        const board = await prisma.board.findUnique({
            where:{id},
            select:{
                title:true,
                orgId:true
            }
        })

        if(!board){
            return res.status(404).json({message:"board not found"})
        }
        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId:board.orgId}}
        })

        const role = membership?.role;
        if(role !== "admin"){
            return res.status(403).json({message:"not authorized to delete "})
        }

        await prisma.board.delete({
            where:{id}
        })
        return res.status(200).json({message:" Board deleted successfully "})
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
};
app.delete(("/deleteBoard/:id"),authMiddleware,deleteBoard);