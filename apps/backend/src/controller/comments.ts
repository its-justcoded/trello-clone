import express, {type Request,type Response} from "express";
import {prisma} from "db/client";
import { authMiddleware } from "../middleware";
import { CommentSchema, UpdateCommentSchema } from "../zod";


const app = express();
app.use(express.json());

const createComment = async(req:Request, res:Response)=>{
    try{
        const {success,data,error} = CommentSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({message:error.message})
        }

        const userId = req.userId;

        const {comments,issueId} = data;

        const comment = await prisma.comments.create({
            data:{comments,issueId}
        })
        return res.status(200).json({
            message:"Comments Created Successfully",
            data:comment
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"})
    }
}
app.post(("/createComment"),authMiddleware,createComment);

const updateComment = async(req:Request, res:Response)=>{
    try{
        const {success,data,error}=UpdateCommentSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({message:error.message})
        }
        const {id}=req.params;
        if(!id || typeof id !=="string"){
            return res.status(400).json({message:"missing comment id"});
        }

        const userId = req.userId;

        const comment = await prisma.comments.findUnique({
            where:{id},
            select:{issue:{select:{section:{select:{board:{select:{orgId:true}}}}}}}
        })

        if(!comment){
            return res.status(404).json({message:"Comment not found"})
        }

        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{
                userId,
                orgId:comment.issue.section.board.orgId}}
        });

        if(!membership){
            return res.status(403).json({message:"not authorized member of the org"})
        }

        const updateComment = await prisma.comments.update({
            where:{id},
            data
        })
        return res.status(200).json({
            message:"comment updated successfully",
            comment:updateComment
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"})
    }
}
app.put(("/updateComment/:id"),authMiddleware,updateComment);

const getComment = async(req:Request,res:Response)=>{
    try{
        const {id} = req.params;
        if(!id || typeof id !=="string"){
            return res.status(400).json({message:"missing comment id"})
        };
        const userId = req.userId;

        const comment = await prisma.comments.findUnique({
            where:{id},
            select:{
                comments:true,
                issue:{select:{section:{select:{board:{select:{orgId:true}}}}}}
            }
        })
        if(!comment){
            return res.status(404).json({message:"comments not found"});
        }

        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId:comment.issue.section.board.orgId}}
        })

        if(!membership){
            return res.status(403).json({message:"not authorized to view this org"})
        };

        return res.status(200).json({
            message:"comments fetched successfully",
            data:{id, comment:comment.comments}
        })

    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
}
app.get(("/comments/:id"),authMiddleware,getComment);

const deleteComment = async(req:Request,res:Response)=>{
    try{
        const{id} = req.params;
        if(!id || typeof id !== "string"){
            return res.status(400).json({message:"missing comments id"});
        }

        const userId = req.userId;
        const comment = await prisma.comments.findUnique({
            where:{id},
            select:{issue:{select:{section:{select:{board:{select:{orgId:true}}}}}}}
        })

        if(!comment){
            return res.status(404).json({message:"comment not found"});
        }

        const membership =await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId:comment.issue.section.board.orgId}}
        })

        const role = membership?.role;

        if(role !== "admin"){
            return res.status(403).json({message:"not authorized to delete this comments"})
        };

        await prisma.comments.delete({
            where:{id}
        })

        return res.status(200).json({
            message:"comments deleted successfully",
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"})
    }
}
app.delete(("/deleteComments/:id"),authMiddleware,deleteComment);
