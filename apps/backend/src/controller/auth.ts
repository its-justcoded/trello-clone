import express, {type Request,type Response}from "express";
import {prisma} from "db/client";
import { SignupSchema,LoginSchema } from "./../zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET=process.env.JWT_SECRET||"";

const app = express();
app.use(express.json())

const signup =async (req:Request,res:Response)=>{
    try{
         const {success, data, error } = SignupSchema.safeParse(req.body);
         if(!success){
             return res.status(400).json({message:error.message})
         }
 
         const {email, password} = data;
         const ExistingUser = await prisma.user.findUnique({where:{email}});
         if(ExistingUser){
             return res.status(409).json({message:"invalid email or password"});
         }
 
         const hashedPassword = await bcrypt.hash(password,10);
          await prisma.user.create({
             data:{email,password:hashedPassword}
         })
         return res.status(201).json({
             message:"User created successfully!",
         })
    }
    catch(error){
     return res.status(500).json({message:"Internal server error!!"})
    }
 };
app.post("/signup",signup);

const login =async (req:Request,res:Response)=>{
    try{
        const {success,data,error}=LoginSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({message:error.message})
        }
        const {email,password} = data;
        const user = await prisma.user.findUnique({where:{email}});
        if(!user){
            return res.status(404).json({message:"user not found!!"})
        }
        const validPassword = await bcrypt.compare(data.password,user.password);
        if(!validPassword){
            return res.status(401).json({message:"incorrect Password"});
        }
        const token = jwt.sign({
            id:user.id,
            email:user.email},JWT_SECRET)

        return res.status(201).json({
            message:"Login successfully!"
        })
    }
    catch(error){
        return res.status(500).json({message:"Internal server error!!"})
    }
};
app.post ("/login",login);