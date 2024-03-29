const jwt = require('jsonwebtoken')
import { Request,Response,NextFunction } from "express";

export const authenticatejwt=(req:Request,res:Response,next:NextFunction)=>{
    try{
        const token = req.headers.authorization?.split(' ')[1];
        const {id}=jwt.verify(token,process.env.JWTPRIVATEKEY)
        req.headers.id=id;
        next()
    }catch(err)
    {
        console.log(err)
        return res.status(401).send({success:false,error:err,message:"Authentication failed"})
    }
}