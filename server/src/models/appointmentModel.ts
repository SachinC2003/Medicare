const joi = require('joi');
import mongoose from 'mongoose';

const appointmentSchema =new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },
    doctorid:
    {
        type:String , 
        required: true
    },
    doctorInfo:
    {
        type:Object , 
        required: true
    },
    userInfo:
    {
        type:Object , 
        required: true
    },
    date:
    {
        type:String , 
        required: true
    },
    time:
    {
        type:String, 
        required: true
    },
    status:{
        type:String,
        default:'Pending',
    }
},{
    timestamps:true
});


export const appointmentValidation=(data:{})=>{
    const schema = joi.object({
        userid: joi.string().required(),
        doctorid: joi.string().required(),
        date: joi.string().required(),
        time: joi.string().required(),
        doctorInfo :joi.object(),
        userInfo:joi.object(),
    })
    return schema.validate(data);
}
export const appointmentModel =mongoose.model("appointments",appointmentSchema)