
import { Request,Response,NextFunction } from "express";
import moment from "moment";
import { appointmentModel, appointmentValidation } from "../../models/appointmentModel";
import { doctorModel } from "../../models/doctorModel";

export const checkBookingAvailabilty=async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const {error} =appointmentValidation(req.body);
        if(error)
            return res.status(400).send({message: error.details[0].message , success:false} );
        const date = moment(req.body.date,"DD-MM-YYYY");
        const fromTime = moment(req.body.time,"HH:mm").subtract(30,'minutes');
        const toTime = moment(req.body.time,"HH:mm").add(30,'minutes');
        
        const currentDateTime = moment();
        if (date.isBefore(currentDateTime, 'day'))
            return res.status(400).send({message:"Requested date is in the past.", success:false})
        if (date.isSame(currentDateTime, 'day') && fromTime.isBefore(currentDateTime, 'minute')) 
            return res.status(400).send({message:"Requested time is in the past.", success:false}) 
        if (date.isSame(currentDateTime, 'day') && toTime.isBefore(currentDateTime, 'minute')) 
            return res.status(400).send({message:"Requested time is in the past.", success:false})
        const doctorid=req.body.doctorid;
        const doctor = await doctorModel.findById(doctorid);
        if(req.body.time>doctor?.timings[1] || req.body.time<doctor?.timings[0])
            return res.status(400).send({message:"Booking slot not available in doctor's timings", success:false})
        const userAppointments = await appointmentModel.find({
            doctorid:doctorid,
            userid:req.body.userid,
            date:date.format("DD-MM-YYYY"),
        }) 
        if(userAppointments.length!==0)
         return res.status(400).send({message:"You can not book more than one appointment of same doctor in a day.", success:false})
        const appointments = await appointmentModel.find({
            doctorid:doctorid,
            date:date.format("DD-MM-YYYY"),
            time:{$gte:fromTime.format("HH:mm"),$lte:toTime.format("HH:mm")},
            status:'Approved'
        }) 
        if(appointments.length!==0)
        return res.status(400).send({message:"Booking slot not available, try some different time", success:false})
        next()
    }catch(err)
    {
        console.log(err)
        return res.status(500).send({success:false,error:err,message:"Error booking appointment"})
    }
}