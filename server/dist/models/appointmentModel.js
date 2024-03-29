"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentModel = exports.appointmentValidation = void 0;
const joi = require('joi');
const mongoose_1 = __importDefault(require("mongoose"));
const appointmentSchema = new mongoose_1.default.Schema({
    userid: {
        type: String,
        required: true
    },
    doctorid: {
        type: String,
        required: true
    },
    doctorInfo: {
        type: Object,
        required: true
    },
    userInfo: {
        type: Object,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
    }
}, {
    timestamps: true
});
const appointmentValidation = (data) => {
    const schema = joi.object({
        userid: joi.string().required(),
        doctorid: joi.string().required(),
        date: joi.string().required(),
        time: joi.string().required(),
        doctorInfo: joi.object(),
        userInfo: joi.object(),
    });
    return schema.validate(data);
};
exports.appointmentValidation = appointmentValidation;
exports.appointmentModel = mongoose_1.default.model("appointments", appointmentSchema);
