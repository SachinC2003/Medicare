import mongoose from 'mongoose';
const joi = require('joi');
const doctorSchema =new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    firstName:
    {
        type:String , 
        required: true
    },
    lastName:
    {
        type:String , 
        required: true
    },
    phoneNumber:
    {
        type:String , 
        required: true
    },
    website:
    {
        type:String , 
        required: true
    },
    address:
    {
        type:String , 
        required: true
    },
    specialization:
    {
        type:String , 
        required: true
    },
    experience:
    {
        type:Number , 
        required: true
    },
    feePerConsultation:
    {
        type:Number , 
        required: true
    },
    timings:{
        type:Array,
        required:true
    },
    status:{
        type:String,
        default:'Pending',
    }
},{
    timestamps:true
});


export const applyDoctorValidate=(data:{})=>{
    const schema = joi.object({
        userid: joi.string().required(),
        firstName: joi.string().min(2).max(15).required(),
        lastName: joi.string().min(2).max(15).required(),
        phoneNumber: joi.string().min(10).max(15).regex(/^\d+$/).required(),
        website: joi.string().max(50),
        address: joi.string().max(200).required(),
        specialization: joi.string().required(),
        experience: joi.number().required(),
        feePerConsultation: joi.number().required(),
        timings:joi.array().required(),
    })
    return schema.validate(data);
}
export const doctorModel =mongoose.model("doctors",doctorSchema)
