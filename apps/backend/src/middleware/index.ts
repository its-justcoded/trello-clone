import type { Request, Response, NextFunction} from "express";
import jwt ,{type Jwt, type JwtPayload} from "jsonwebtoken";

declare global{
    namespace Express{
        interface Request{
            userId:string,
        }
    }
}

export const authMiddleware =(
    req:Request,
    res:Response,
    next:NextFunction
)=>{

    const token = req.headers.authorization;

    if(!token){
        return res.status(400).json({
            message:"no token",
        })
    }

    try{
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        )as JwtPayload;

        req.userId = decoded.id ?? decoded.userId;

        next()   
    }
    catch(error){
        return res.status(401).json({
            message:"invalid token",
        });
    }
}