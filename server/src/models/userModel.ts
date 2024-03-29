import mongoose, { ObjectId } from 'mongoose';
import jwt from 'jsonwebtoken';
const joi = require('joi');
const passwordComplexity= require('joi-password-complexity');
const userSchema =new mongoose.Schema({
    name:
    {
        type:String , 
        required: true
    },
    email:
    {
        type:String ,
        required: true
    },
    password:{
        type:String ,
        required: true
    },
    isDoctor:{
        type:Boolean ,
        default:false
    },
    isAdmin:{
        type:Boolean , 
        default:false
    }, 
    status:{
        type:String , 
        default:"Ok"
    },
    seenNotifications:{
        type:Array,
        default:[],
    },
    unseenNotifications:{
        type:Array,
        default:[],
    },
},{
    timestamps:true
});


export const userModel = mongoose.model("users",userSchema);
export const generateAuthToken = function(id:any){
    const token = jwt.sign({id}, process.env.JWTPRIVATEKEY!);
    return token;
}

export const loginValidate=(data:{})=>{
    const schema = joi.object({
        email:joi.string().email().required().label("Email"),
        password:passwordComplexity().required().label("Password")
    })
    return schema.validate(data);
}
export const registerValidate=(data:{name:string , email:string ,password:string})=>{
    const schema = joi.object({
        name:joi.string().required().label("Name"),
        email:joi.string().email().required().label("Email"),
        password:passwordComplexity().required().label("Password")
    })
    return schema.validate(data);
}


