import express, {type Request, type Response} from "express";
import { prisma } from "db/client";
import { authMiddleware } from "../middleware";
import { SectionSchema, UpdateSectionSchema } from "../zod";

const app = express();
app.use(express.json());

const createSection = async(req:Request,res:Response)=>{
    try{
        const {success,data,error}=SectionSchema.safeParse(req.body);
        if(!success) {
            return res.status(400).json({message:error.message})
        };
        const userId = req.userId;
    
        const{title,boardId} = data;
    
        const sections = await prisma.sections.create({
            data:{title,boardId}
        });

        return res.status(200).json({
            message:"section created successfully",
            data:sections
        });
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"});
    };
    

}

app.post (("/section"),authMiddleware,createSection);


const updateSection =async(req:Request,res:Response)=>{
    try{
        const {success,data,error} = UpdateSectionSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({message:error.message})
        
        };
        const {id} = req.params;
        if(!id ||typeof id !== "string"){
            return res.status(400).json({message:"missing section id"})
        };
        const userId = req.userId;

        const section = await prisma.sections.findUnique({
            where:{id},
            select:{board:{select:{orgId:true}}}
        });

        if(!section){
            return res.status(404).json({message:"section not found"});
        }
        
        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId, orgId:section.board.orgId}}
        });

        const role = membership?.role;

        if(role !=="admin"){
            return res.status(403).json({message:"not authorized to make changes"})
        };

        const {title} = data;
        
        const updatedSection = await prisma.sections.update({
            where:{id:id},
            data:{title}
        });
        return res.status(200).json({
            message:"sections updated successfully",
            data:updatedSection
        });
    }
    catch(error){
        return res.status(500).json({message:"internal server error"});
    }

}
app.put(("/updateSection/:id"),authMiddleware,updateSection)

const getSection =async(req:Request, res:Response)=>{
    try{
        const {id} = req.params;

        if(!id || typeof id !=="string"){
            return res.status(400).json({message:"missing section id"})
        };
        const userId = req.userId;

        const section = await prisma.sections.findUnique({
            where:{id},
            select:{
                title:true,
                board:{select:{orgId:true}}
            }
        })
        if(!section){
            return res.status(404).json({message:"section not found"});
        }

        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId:section.board.orgId}}
        })

        if(!membership){
            return res.status(403).json({message:"not authorized to view this section"})
        };

        return res.status(200).json({
            message:"section fetched successfully",
            data:{id, title:section.title}
        })

    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }

}

app.get(("/section/:id"),authMiddleware,getSection);

const deleteSection = async(req:Request, res:Response)=>{
    try{
        const {id} = req.params;

        if(!id ||typeof id !=="string"){
            return res.status(400).json({message:"missing section id"})
        }

        const userId = req.userId;

        const section = await prisma.sections.findUnique({
            where:{id},
            select:{
                title:true,
                board:{select:{orgId:true}}
            }
        });

        if(!section){
            return res.status(404).json({message:"session not found"})
        }

        const membership = await prisma.membership.findUnique({
            where:{userId_orgId:{userId,orgId:section.board.orgId}}
        })

        const role = membership?.role;
        if(role !== "admin"){
            return res.status(403).json({message:"not authorized to delete "})
        }

        await prisma.sections.delete({
            where:{id}
        })
        return res.status(200).json({message:" Section deleted successfully "})
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
};
app.delete(("/deleteSection/:id"),authMiddleware,deleteSection);