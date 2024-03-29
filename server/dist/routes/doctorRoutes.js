"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const authMiddleWare_1 = require("./authMiddleWare");
const userModel_1 = require("../models/userModel");
const doctorModel_1 = require("../models/doctorModel");
const appointmentModel_1 = require("../models/appointmentModel");
const checkBookingAvailability_1 = require("./middlewares/checkBookingAvailability");
const moment_1 = __importDefault(require("moment"));
const router = require('express').Router();
exports.router = router;
router.get('/me', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        const doctor = yield doctorModel_1.doctorModel.findOne({ userid: user._id });
        if (!doctor)
            return res.status(400).send({ message: "Doctor does not exist", success: false });
        if (!(doctor.status === 'Approved'))
            return res.status(400).send({ message: "Your account is not approved", success: false });
        else {
            return res.status(200).send({
                success: true,
                message: "Doctor information fetched successfully",
                data: doctor
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ success: false, message: "Error getting doctor", error });
    }
}));
router.post('/updateprofile', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        const doctor = yield doctorModel_1.doctorModel.findOne({ userid: user._id });
        if (!doctor)
            return res.status(400).send({ message: "Doctor does not exist", success: false });
        if (!(doctor.status === 'Approved'))
            return res.status(400).send({ message: "Your account is not approved", success: false });
        const newdata = req.body;
        yield doctorModel_1.doctorModel.findByIdAndUpdate(doctor._id, newdata);
        return res.status(200).send({
            success: true,
            message: "Doctor information Updated successfully",
            data: doctor
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ success: false, message: "Error getting doctor", error });
    }
}));
router.post('/getbyid', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        const doctor = yield doctorModel_1.doctorModel.findById(req.body.doctorid);
        if (!doctor)
            return res.status(400).send({ message: "Doctor does not exist", success: false });
        if (!(doctor.status === 'Approved'))
            return res.status(400).send({ message: "Doctor's account is not approved", success: false });
        else {
            return res.status(200).send({
                success: true,
                message: "Doctor information fetched successfully",
                data: doctor
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ success: false, message: "Error getting doctor", error });
    }
}));
router.post('/bookappointment', authMiddleWare_1.authenticatejwt, checkBookingAvailability_1.checkBookingAvailabilty, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        const doctor = yield doctorModel_1.doctorModel.findById(req.body.doctorid);
        if (!doctor)
            return res.status(400).send({ message: "Doctor does not exist", success: false });
        if (!(doctor.status === 'Approved'))
            return res.status(400).send({ message: "Doctor's account is not approved", success: false });
        else {
            req.body.status = "Pending";
            yield new appointmentModel_1.appointmentModel(req.body).save();
            const doctorUser = yield userModel_1.userModel.findById(doctor.userid);
            if (!doctorUser)
                return res.status(400).send({ message: "Doctor's user account does not exist", success: false });
            let unseenNotifications = doctorUser.unseenNotifications;
            unseenNotifications = [{
                    type: "appointment-request-recieved",
                    message: `Appointment has been requested by ${req.body.userInfo.name}`,
                    data: {},
                    "onClickPath": "/doctor/appointments"
                }, ...unseenNotifications];
            yield userModel_1.userModel.findByIdAndUpdate(doctorUser._id, { unseenNotifications: unseenNotifications });
            return res.status(200).send({
                success: true,
                message: "Appointment requested successfully",
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(501).send({ success: false, message: "Error booking appointment", error });
    }
}));
router.get('/getallappointments', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "Doctor's user account does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "Doctor's user acoount is blocked", success: false });
        const doctor = yield doctorModel_1.doctorModel.findOne({ userid: user._id });
        if (!doctor)
            return res.status(400).send({ message: "Doctor does not exist", success: false });
        if (!(doctor.status === 'Approved'))
            return res.status(400).send({ message: "Doctor's account is not approved", success: false });
        else {
            const currentDate = (0, moment_1.default)().format("DD-MM-YYYY");
            const appointments = yield appointmentModel_1.appointmentModel.find({ doctorid: doctor._id, date: { $gte: currentDate } });
            return res.status(200).send({
                success: true,
                data: {
                    appointments: appointments,
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ success: false, message: "Error getting appointments", error });
    }
}));
router.post('/changeappointmentstatus', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        const doctor = yield doctorModel_1.doctorModel.findById(req.body.doctorid);
        if (!doctor)
            return res.status(400).send({ message: "Doctor does not exist", success: false });
        if (!(doctor.status === 'Approved'))
            return res.status(400).send({ message: "Doctor's account is not approved", success: false });
        else {
            const appointment_id = req.body.appointment_id;
            const status = req.body.status;
            const clientuserid = req.body.clientuserid;
            const appointment = yield appointmentModel_1.appointmentModel.findById(appointment_id);
            if (!appointment)
                return res.status(400).send({ message: "Appoitnment does not exist", success: false });
            const fromTime = (0, moment_1.default)(appointment === null || appointment === void 0 ? void 0 : appointment.time, "HH:mm").subtract(30, 'minutes');
            const toTime = (0, moment_1.default)(appointment === null || appointment === void 0 ? void 0 : appointment.time, "HH:mm").add(30, 'minutes');
            const conflictingAppointments = yield appointmentModel_1.appointmentModel.find({
                doctorid: appointment.doctorid,
                date: appointment.date,
                time: { $gte: fromTime.format("HH:mm"), $lte: toTime.format("HH:mm") },
                status: 'Approved'
            });
            if (conflictingAppointments.length !== 0 && status === "Approved")
                return res.status(400).send({ message: "Slot not available to approve", success: false });
            yield appointmentModel_1.appointmentModel.findByIdAndUpdate(appointment_id, { status: status });
            const clientuser = yield userModel_1.userModel.findById(clientuserid);
            if (!clientuser)
                return res.status(400).send({ message: "user account does not exist", success: false });
            let unseenNotifications = clientuser.unseenNotifications;
            unseenNotifications = [{
                    type: "appointment-request-approved",
                    message: `Your appointment has been ${status} by ${doctor.firstName} ${doctor.lastName}`,
                    data: {},
                    "onClickPath": "/protectedhome"
                }, ...unseenNotifications];
            yield userModel_1.userModel.findByIdAndUpdate(clientuserid, { unseenNotifications: unseenNotifications });
            const appointments = yield appointmentModel_1.appointmentModel.find({ doctorid: doctor._id });
            return res.status(200).send({
                success: true,
                message: "Appointment status changed successfully",
                data: {
                    appointments: appointments,
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(501).send({ success: false, message: "Error changing appointment status", error });
    }
}));
