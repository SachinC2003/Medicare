import { Request, Response } from 'express';
const router= require ('express').Router();
import { userModel, loginValidate, registerValidate, generateAuthToken } from '../models/userModel';
import bcrypt from 'bcrypt';
import { authenticatejwt } from './authMiddleWare';
import { applyDoctorValidate, doctorModel } from '../models/doctorModel';
import { appointmentModel } from '../models/appointmentModel';
import moment from 'moment';

router.post('/register',async (req:Request,res:Response)=>{
    try {
        
        const {error} =registerValidate (req.body);
        if(error)
            return res.status(400).send({message: error.details[0].message , success:false} );
        let user = await userModel.findOne({name:req.body.name})
        if(user)
            return res.status(409).send({message: "User with given name already exists" , success:false});
        user = await userModel.findOne({email:req.body.email})
        if(user)
            return res.status(409).send({message: "User with given email already exists", success:false});
        const salt=await bcrypt.genSalt(Number(process.env.SALT))
        const hashPassword=await bcrypt.hash(req.body.password,salt)

        await new userModel({...req.body, password:hashPassword}).save()
        const usernew = await userModel.findOne({name:req.body.name})
        if(!usernew)return res.status(500).send({message: "Error creating user" , success:false});
        const token = generateAuthToken(usernew._id);
        return res.status(201).send({authToken: token , message:"Signed in successfully" , success:true})
    }
    catch(err){
        console.log(err)
        return res.status(500).send({message: "Internal server error" , success:false});
    }
})


router.post('/login',async (req:Request,res:Response)=>{
    try {
        const {error} = loginValidate(req.body);
        if(error)
            return res.status(400).send({message:error.details[0].message , success:false});
        const user = await userModel.findOne({email:req.body.email})
        if(!user)
            return res.status(401).send({message:"User with given username does not exist", success:false});
        const validatePassword = await bcrypt.compare(req.body.password,user.password);
        if(!validatePassword) 
            return res.status(401).send({message:"Incorrect password" ,success:false});
        const token = generateAuthToken(user._id);
        res.status(200).send({authToken: token , message:"Logged in successfully", success:true})
    }catch (err)
    {
        console.log(err)
        return res.status(500).send({message: "Internal server error", success:false,err});
    }
})

router.get('/me', authenticatejwt , async (req:Request , res: Response)=>{
    try {
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})
        else
        {
            return res.status(200).send(
            {
                success:true,
                data:
                {
                    id:user._id,
                    name:user.name,
                    email:user.email,
                    isAdmin:user.isAdmin,
                    isDoctor:user.isDoctor,
                    status:user.status,
                    notificationCount:user.unseenNotifications.length
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send({success:false,message:"Error getting user" ,error})
    }
})

router.post('/applydoctor', authenticatejwt , async (req:Request , res: Response)=>{
    try {
        
        const {error} =applyDoctorValidate(req.body);
        
        if(error)
            return res.status(400).send({message: error.details[0].message , success:false} );
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})
        let newDoctor = await doctorModel.findOne({userid:req.body.userid})
        if(newDoctor)
        {
            if(newDoctor.status === 'Pending') return res.status(409).send({message: "Your request is already made" , success:false})
            else return res.status(409).send({message: "You are already registered as doctor" , success:false}) 
        }
        newDoctor = new doctorModel({...req.body})
        
        const userAdmin = await userModel.findOne({isAdmin:true})
        if(!userAdmin)return res.status(500).send({message: "Error finding admin" , success:false});
        const unseenNotifications= userAdmin.unseenNotifications;
        unseenNotifications.push({
            type:"new-doctor-request",
            message : `${newDoctor.firstName} ${newDoctor.lastName} has applied for doctor account.`,
            data:{
                doctorId:newDoctor._id,
                name:newDoctor.firstName +' '+newDoctor.lastName
            },
            onClickPath:'/admin/doctors'
        })  
        await newDoctor.save();
        await userModel.findByIdAndUpdate(userAdmin._id , {unseenNotifications:unseenNotifications})
        res.status(200).send({message: "Applied for doctor successfully" , success:true} )
    }
    catch(err){
        console.log(err)
        return res.status(500).send({message: "Internal server error" , success:false});
    }
})

router.get('/notifications',authenticatejwt,async (req:Request,res:Response)=>{
    try {
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})
        else
        {
            return res.status(200).send(
            {
                success:true,
                data:
                {
                    unseenNotifications:user.unseenNotifications,
                    seenNotifications:user.seenNotifications
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send({success:false,message:"Error getting user" ,error})
    }
})

router.get('/notifications/markallread',authenticatejwt,async (req:Request,res:Response)=>{
    try {
        let user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})
        else
        {
            let unseenNotifications=user.unseenNotifications;
            let seenNotifications=user.seenNotifications;
            seenNotifications=[...unseenNotifications,...seenNotifications]
            unseenNotifications=[]
            await userModel.findByIdAndUpdate(user._id , {unseenNotifications:unseenNotifications})
            await userModel.findByIdAndUpdate(user._id , {seenNotifications:seenNotifications})
            user = await userModel.findOne({_id:req.headers.id})
            return res.status(200).send(
            {
                success:true,
                message:"Marked all as read",
                data:
                {
                    unseenNotifications:user!.unseenNotifications,
                    seenNotifications:user!.seenNotifications
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Internal Server Error" ,error})
    }
})

router.post('/notifications/markoneread',authenticatejwt,async (req:Request,res:Response)=>{
    try {
        let user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})
        else
        {
            
            const notification_message = req.body.notification_message;
            let unseenNotifications=user.unseenNotifications;
            
            let _notification = unseenNotifications.find((notification)=>{return notification.message === notification_message})
            
            unseenNotifications=unseenNotifications.filter((notification)=>{return notification.message!==notification_message})
            let seenNotifications=user.seenNotifications;
            if(_notification?.message)seenNotifications=[_notification,...seenNotifications]
            await userModel.findByIdAndUpdate(user._id , {unseenNotifications:unseenNotifications})
            await userModel.findByIdAndUpdate(user._id , {seenNotifications:seenNotifications})
            user = await userModel.findOne({_id:req.headers.id})
            return res.status(200).send(
            {
                success:true,
                message:"Marked as read",
                data:
                {
                    unseenNotifications:user!.unseenNotifications,
                    seenNotifications:user!.seenNotifications
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Internal Server Error" ,error})
    }
})

router.get('/notifications/deleteall',authenticatejwt,async (req:Request,res:Response)=>{
    try {
        let user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})
        else
        {
            await userModel.findByIdAndUpdate(user._id , {seenNotifications:[]})
            user = await userModel.findOne({_id:req.headers.id})
            return res.status(200).send(
            {
                success:true,
                message:"Successfully deleted all",
                data:
                {
                    seenNotifications:user!.seenNotifications
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Internal Server Error" ,error})
    }
})

router.post('/notifications/deleteone',authenticatejwt,async (req:Request,res:Response)=>{
    try {
        let user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})
        else
        {
            const notification_message = req.body.notification_message;
            let seenNotifications=user.seenNotifications;
            seenNotifications= seenNotifications.filter((notification)=>{
                return notification.message !== notification_message
            })
            await userModel.findByIdAndUpdate(user._id , {seenNotifications:seenNotifications})
            user = await userModel.findOne({_id:req.headers.id})
            return res.status(200).send(
            {
                success:true,
                message:"Successfully deleted",
                data:
                {
                    seenNotifications:user!.seenNotifications
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Internal Server Error" ,error})
    }
})


router.get('/getallapproveddoctors', authenticatejwt , async (req:Request , res: Response)=>{
    try {
        let user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})
        else
        {   
            const approvedDoctors = await doctorModel.find({status:"Approved"});
            return res.status(200).send(
            {
                success:true,
                data:
                {
                    approvedDoctors:approvedDoctors,
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Eroor getting doctors" ,error})
    }
})


router.get('/getallappointments', authenticatejwt , async (req:Request , res: Response)=>{
    try {
        let user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})
        else
        {   
            const currentDate = moment().format("DD-MM-YYYY");
            const appointments = await appointmentModel.find({userid:user._id , date:{$gte:currentDate} });
            return res.status(200).send(
            {
                success:true,
                data:
                {
                    appointments:appointments,
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Eroor getting appointments" ,error})
    }
})

router.post('/cancelappointment',authenticatejwt,async (req:Request,res:Response)=>{
    try {
        let user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})
        else
        {
            const appointment_id = req.body.appointment_id;
            const appointment = await appointmentModel.findById(appointment_id);
            if(!appointment) return res.status(400).send({message:"Appoitnment does not exist", success:false})
            await appointmentModel.findByIdAndDelete(appointment_id);
            const doctoruserid = appointment.doctorInfo.userid;
            const doctoruser = await userModel.findById(doctoruserid);
            if(!doctoruser) return res.status(400).send({message:"doctor user account does not exist", success:false})
            let unseenNotifications = doctoruser.unseenNotifications;
            unseenNotifications=[{
                type: "appointment-request-approved",
                message: `${appointment.userInfo.name} has canceled appointment`,
                data: {},
                "onClickPath": "/protectedhome"
            },...unseenNotifications]
            await userModel.findByIdAndUpdate(doctoruserid,{unseenNotifications:unseenNotifications})
            const appointments = await appointmentModel.find({userid:appointment.userid});
            return res.status(200).send(
                {
                    success:true,
                    message:"Appointment canceled successfully",
                    data:
                    {
                        appointments:appointments,
                    }
                })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({success:false,message:"Internal Server Error" ,error})
    }
})
export  {router};