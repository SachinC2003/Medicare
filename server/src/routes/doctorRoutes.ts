import { Request, Response } from 'express';
import { authenticatejwt } from './authMiddleWare';
import { userModel } from '../models/userModel';
import { doctorModel } from '../models/doctorModel';
import { appointmentModel } from '../models/appointmentModel';
import { checkBookingAvailabilty } from './middlewares/checkBookingAvailability';
import moment from 'moment';

const router= require ('express').Router();

router.get('/me', authenticatejwt , async (req:Request , res: Response)=>{
    try {
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})   
        const doctor = await doctorModel.findOne({userid:user._id})
        if(!doctor) return res.status(400).send({message:"Doctor does not exist", success:false})
        if(!(doctor.status==='Approved')) return res.status(400).send({message:"Your account is not approved", success:false})
        else
        {
            return res.status(200).send(
            {
                success:true,
                message:"Doctor information fetched successfully",
                data:doctor
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send({success:false,message:"Error getting doctor" ,error})
    }
})


router.post('/updateprofile', authenticatejwt , async (req:Request , res: Response)=>{
    try {
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})   
        const doctor = await doctorModel.findOne({userid:user._id})
        if(!doctor) return res.status(400).send({message:"Doctor does not exist", success:false})
        if(!(doctor.status==='Approved')) return res.status(400).send({message:"Your account is not approved", success:false})
        const newdata = req.body;
        await doctorModel.findByIdAndUpdate(doctor._id,newdata)
        return res.status(200).send(
            {
                success:true,
                message:"Doctor information Updated successfully",
                data:doctor
            })
        
    } catch (error) {
        console.log(error)
        return res.status(400).send({success:false,message:"Error getting doctor" ,error})
    }
})

router.post('/getbyid', authenticatejwt , async (req:Request , res: Response)=>{
    try {
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})   
        const doctor = await doctorModel.findById(req.body.doctorid)
        if(!doctor) return res.status(400).send({message:"Doctor does not exist", success:false})
        if(!(doctor.status==='Approved')) return res.status(400).send({message:"Doctor's account is not approved", success:false})
        else
        {
            return res.status(200).send(
            {
                success:true,
                message:"Doctor information fetched successfully",
                data:doctor
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send({success:false,message:"Error getting doctor" ,error})
    }
})

router.post('/bookappointment', authenticatejwt , checkBookingAvailabilty, async (req:Request , res: Response)=>{
    try {
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false})   
        const doctor = await doctorModel.findById(req.body.doctorid)
        if(!doctor) return res.status(400).send({message:"Doctor does not exist", success:false})
        if(!(doctor.status==='Approved')) return res.status(400).send({message:"Doctor's account is not approved", success:false})
        else
        {
            req.body.status = "Pending";
            await new appointmentModel(req.body).save();
            const doctorUser = await userModel.findById(doctor.userid);
            if(!doctorUser) return res.status(400).send({message:"Doctor's user account does not exist", success:false})
            let unseenNotifications = doctorUser.unseenNotifications;
            unseenNotifications=[{
                type: "appointment-request-recieved",
                message: `Appointment has been requested by ${req.body.userInfo.name}`,
                data: {},
                "onClickPath": "/doctor/appointments"
            },...unseenNotifications]
            await userModel.findByIdAndUpdate(doctorUser._id,{unseenNotifications:unseenNotifications})
            return res.status(200).send(
            {
                success:true,
                message:"Appointment requested successfully",
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(501).send({success:false,message:"Error booking appointment" ,error})
    }
})

router.get('/getallappointments', authenticatejwt , async (req:Request , res: Response)=>{
    try {
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"Doctor's user account does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"Doctor's user acoount is blocked", success:false})   
        const doctor = await doctorModel.findOne({userid:user._id})
        if(!doctor) return res.status(400).send({message:"Doctor does not exist", success:false})
        if(!(doctor.status==='Approved')) return res.status(400).send({message:"Doctor's account is not approved", success:false})  
        else
        {   
            const currentDate = moment().format("DD-MM-YYYY");
            const appointments = await appointmentModel.find({doctorid:doctor._id ,date:{$gte:currentDate}});
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
        return res.status(400).send({success:false,message:"Error getting appointments" ,error})
    }
})


router.post('/changeappointmentstatus', authenticatejwt ,async (req:Request , res: Response)=>{
    try {
        const user = await userModel.findOne({_id:req.headers.id})
        if(!user) return res.status(400).send({message:"User does not exist", success:false})
        if(user.status==='Blocked') return res.status(400).send({message:"User is blocked", success:false}) 
        const doctor = await doctorModel.findById(req.body.doctorid)
        if(!doctor) return res.status(400).send({message:"Doctor does not exist", success:false})
        if(!(doctor.status==='Approved')) return res.status(400).send({message:"Doctor's account is not approved", success:false})
        else
        {
            const appointment_id = req.body.appointment_id;
            const status= req.body.status;
            const clientuserid = req.body.clientuserid;
            const appointment = await appointmentModel.findById(appointment_id);
            if(!appointment) return res.status(400).send({message:"Appoitnment does not exist", success:false})
            const fromTime = moment(appointment?.time,"HH:mm").subtract(30,'minutes');
            const toTime = moment(appointment?.time,"HH:mm").add(30,'minutes');
            const conflictingAppointments =await appointmentModel.find({
                doctorid:appointment.doctorid,
                date:appointment.date,
                time:{$gte:fromTime.format("HH:mm"),$lte:toTime.format("HH:mm")},
                status:'Approved'
            }) 
            if(conflictingAppointments.length!==0 && status==="Approved")
                return res.status(400).send({message:"Slot not available to approve", success:false})
            await appointmentModel.findByIdAndUpdate(appointment_id,{status:status});
            const clientuser = await userModel.findById(clientuserid);
            if(!clientuser) return res.status(400).send({message:"user account does not exist", success:false})
            let unseenNotifications = clientuser.unseenNotifications;
            unseenNotifications=[{
                type: "appointment-request-approved",
                message: `Your appointment has been ${status} by ${doctor.firstName} ${doctor.lastName}`,
                data: {},
                "onClickPath": "/protectedhome"
            },...unseenNotifications]
            await userModel.findByIdAndUpdate(clientuserid,{unseenNotifications:unseenNotifications})
            const appointments = await appointmentModel.find({doctorid:doctor._id});
            return res.status(200).send(
            {
                success:true,
                message:"Appointment status changed successfully",
                data:
                {
                    appointments:appointments,
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(501).send({success:false,message:"Error changing appointment status" ,error})
    }
})

export  {router};