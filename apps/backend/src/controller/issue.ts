import express, {type Request, type Response} from "express";
import { prisma } from "db/client";
import {z} from "zod";
import { authMiddleware} from "../middleware";

const app = express();
app.use(express.json());

app.post (("/CreateIssue"),authMiddleware,async(req:Request,res:Response)=>{

})

app.put(("/UpdateIssue/:id"),authMiddleware,async(req:Request,res:Response)=>{

})

app.get(("/Issue/:id"),authMiddleware,async(req:Request,res:Response)=>{

})

app.delete(("/DeleteIssue/:id"),authMiddleware,async(req:Request,res:Response)=>{
    
})