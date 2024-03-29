import { Request, Response } from 'express';
import { authenticatejwt } from './authMiddleWare';
import { userModel } from '../models/userModel';
import { doctorModel } from '../models/doctorModel';
const router= require ('express').Router();


router.get('/getallusers', authenticatejwt , async (req:Request , res: Response)=>{
    try {
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(!user.isAdmin) return res.status(400).send({message:"Not a admin", success:false})
        else
        {   
            const users = await userModel.find({}, '-seenNotifications -unseenNotifications');
            return res.status(200).send(
            {
                success:true,
                data:
                {
                    users:users,
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send({success:false,message:"Error getting users" ,error})
    }
})

router.get('/getalldoctors', authenticatejwt , async (req:Request , res: Response)=>{
    try {
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(!user.isAdmin) return res.status(400).send({message:"Not a admin", success:false})
        else
        {   
            const doctors = await doctorModel.find({});
            return res.status(200).send(
            {
                success:true,
                data:
                {
                    doctors:doctors,
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send({success:false,message:"Error getting doctors" ,error})
    }
})

router.post('/changeuserstatus',authenticatejwt,async (req:Request,res:Response)=>{
    try {
        let user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(!user.isAdmin) return res.status(400).send({message:"Not a admin", success:false})
        else
        {
            const status = req.body.status;
            const userid = req.body.userid;
            await userModel.findByIdAndUpdate(userid , {status:status})
            const users = await userModel.find({}, '-seenNotifications -unseenNotifications');
            return res.status(200).send(
            {
                success:true,
                message:"Status successfully changed",
                data:
                {
                    users:users
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Internal Server Error" ,error})
    }
})


router.post('/changedoctorstatus',authenticatejwt,async (req:Request,res:Response)=>{
    try {
        let user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(!user.isAdmin) return res.status(400).send({message:"Not a admin", success:false})
        else
        {
            const userid = req.body.userid;
            const status = req.body.status;
            let isDoctor;
            if(status==="Approved"){isDoctor= true}
            else {isDoctor= false}
            const doctoruser = await userModel.findById(userid)
            if(!doctoruser) return res.status(400).send({message:"User account of doctor does not exist", success:false})
            await doctorModel.findOneAndUpdate({userid:userid }, {
                status:status,
            })
            const notification = 
                {
                    "type": "doctor-status-changed",
                    "message": `Your account has been ${status}`,
                    "data": {
                    },
                    "onClickPath": "/protectedhome"
                }
            doctoruser.unseenNotifications.push(notification)
            await userModel.findByIdAndUpdate(userid,{
                unseenNotifications:doctoruser.unseenNotifications,
                isDoctor:isDoctor,
            })
            
            const doctors = await doctorModel.find({});
            return res.status(200).send(
            {
                success:true,
                message:"Status successfully changed",
                data:
                {
                    doctors:doctors,
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Internal Server Error" ,error})
    }
})


export  {router};