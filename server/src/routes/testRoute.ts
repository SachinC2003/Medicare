import { Request, Response } from 'express';
const router= require ('express').Router();

router.get('/',(req:Request , res: Response)=>{
    
            return res.status(200).send(
            {
                success:true,
                message:"Server is woring",
            })
   
})

export  {router};
