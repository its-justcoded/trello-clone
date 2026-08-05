import express, {type Request, type Response} from "express";
import { prisma } from "db/client";
import {z} from "zod";
import { authMiddleware} from "../middleware";
import { IssueSchema, UpdateIssueSchema } from "../zod";

const app = express();
app.use(express.json());

app.post (("/CreateIssue"),authMiddleware,async(req:Request,res:Response)=>{
    try{
        const {success,data,error}=IssueSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({message:error.message})
        }
        const userId = req.userId;
        const{title,description,sectionId,boardId} = data;

        const issue = await prisma.issue.create({
            data:{title,description,sectionId,boardId}
        });
        return res.status(200).json({
            message:"issue created successfully",
            data:issue
        })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
})

app.put(("/UpdateIssue/:id"),authMiddleware,async(req:Request,res:Response)=>{
    try{
        const {success,data,error}=UpdateIssueSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({message:error.message})
        }
        const {id} = req.params;
        if(!id || typeof id !== "string"){
            return res.status(400).json({message:"missing issue id"})
        }
        const userId = req.userId;

        const issue = await prisma.issue.findUnique({
            where:{id},
            select:{board:{select:{orgId:true}}}
        });
        if(!issue){
            return res.status(404).json({message:"issue not found"})
        }

        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId:issue.board.orgId}}
        });
        const role = membership?.role;
        if(role!=="admin"){
            return res.status(403).json({message:"not authorized to make changes"})
        }

        const updatedIssue = await prisma.issue.update({
            where:{id},
            data
        })
        return res.status(200).json({
            message:"issue updated successfully",
            data:updatedIssue
        })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"});
    }

})

app.get(("/Issue/:id"),authMiddleware,async(req:Request,res:Response)=>{

})

app.delete(("/DeleteIssue/:id"),authMiddleware,async(req:Request,res:Response)=>{

})