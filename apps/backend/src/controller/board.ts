import express,{type Request, type Response} from "express";
import {prisma} from "db/client";
import {z} from "zod";
import { authMiddleware } from "../middleware";

const app = express();
app.use(express.json());

app.post (("/CreateBoard"),authMiddleware,async(req:Request,res:Response)=>{

})

app.put(("/UpdateBoard/:id"),authMiddleware,async(req:Request,res:Response)=>{

})

app.get(("/Board/:id"),authMiddleware,async(req:Request,res:Response)=>{

})

app.delete(("/deleteBoard/:id"),authMiddleware,async(req:Request,res:Response)=>{
    
})