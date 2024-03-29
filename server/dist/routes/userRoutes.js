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
const router = require('express').Router();
exports.router = router;
const userModel_1 = require("../models/userModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const authMiddleWare_1 = require("./authMiddleWare");
const doctorModel_1 = require("../models/doctorModel");
const appointmentModel_1 = require("../models/appointmentModel");
const moment_1 = __importDefault(require("moment"));
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, userModel_1.registerValidate)(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message, success: false });
        let user = yield userModel_1.userModel.findOne({ name: req.body.name });
        if (user)
            return res.status(409).send({ message: "User with given name already exists", success: false });
        user = yield userModel_1.userModel.findOne({ email: req.body.email });
        if (user)
            return res.status(409).send({ message: "User with given email already exists", success: false });
        const salt = yield bcrypt_1.default.genSalt(Number(process.env.SALT));
        const hashPassword = yield bcrypt_1.default.hash(req.body.password, salt);
        yield new userModel_1.userModel(Object.assign(Object.assign({}, req.body), { password: hashPassword })).save();
        const usernew = yield userModel_1.userModel.findOne({ name: req.body.name });
        if (!usernew)
            return res.status(500).send({ message: "Error creating user", success: false });
        const token = (0, userModel_1.generateAuthToken)(usernew._id);
        return res.status(201).send({ authToken: token, message: "Signed in successfully", success: true });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: "Internal server error", success: false });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, userModel_1.loginValidate)(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message, success: false });
        const user = yield userModel_1.userModel.findOne({ email: req.body.email });
        if (!user)
            return res.status(401).send({ message: "User with given username does not exist", success: false });
        const validatePassword = yield bcrypt_1.default.compare(req.body.password, user.password);
        if (!validatePassword)
            return res.status(401).send({ message: "Incorrect password", success: false });
        const token = (0, userModel_1.generateAuthToken)(user._id);
        res.status(200).send({ authToken: token, message: "Logged in successfully", success: true });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: "Internal server error", success: false, err });
    }
}));
router.get('/me', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        else {
            return res.status(200).send({
                success: true,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    isDoctor: user.isDoctor,
                    status: user.status,
                    notificationCount: user.unseenNotifications.length
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ success: false, message: "Error getting user", error });
    }
}));
router.post('/applydoctor', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, doctorModel_1.applyDoctorValidate)(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message, success: false });
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        let newDoctor = yield doctorModel_1.doctorModel.findOne({ userid: req.body.userid });
        if (newDoctor) {
            if (newDoctor.status === 'Pending')
                return res.status(409).send({ message: "Your request is already made", success: false });
            else
                return res.status(409).send({ message: "You are already registered as doctor", success: false });
        }
        newDoctor = new doctorModel_1.doctorModel(Object.assign({}, req.body));
        const userAdmin = yield userModel_1.userModel.findOne({ isAdmin: true });
        if (!userAdmin)
            return res.status(500).send({ message: "Error finding admin", success: false });
        const unseenNotifications = userAdmin.unseenNotifications;
        unseenNotifications.push({
            type: "new-doctor-request",
            message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for doctor account.`,
            data: {
                doctorId: newDoctor._id,
                name: newDoctor.firstName + ' ' + newDoctor.lastName
            },
            onClickPath: '/admin/doctors'
        });
        yield newDoctor.save();
        yield userModel_1.userModel.findByIdAndUpdate(userAdmin._id, { unseenNotifications: unseenNotifications });
        res.status(200).send({ message: "Applied for doctor successfully", success: true });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: "Internal server error", success: false });
    }
}));
router.get('/notifications', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        else {
            return res.status(200).send({
                success: true,
                data: {
                    unseenNotifications: user.unseenNotifications,
                    seenNotifications: user.seenNotifications
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ success: false, message: "Error getting user", error });
    }
}));
router.get('/notifications/markallread', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        else {
            let unseenNotifications = user.unseenNotifications;
            let seenNotifications = user.seenNotifications;
            seenNotifications = [...unseenNotifications, ...seenNotifications];
            unseenNotifications = [];
            yield userModel_1.userModel.findByIdAndUpdate(user._id, { unseenNotifications: unseenNotifications });
            yield userModel_1.userModel.findByIdAndUpdate(user._id, { seenNotifications: seenNotifications });
            user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
            return res.status(200).send({
                success: true,
                message: "Marked all as read",
                data: {
                    unseenNotifications: user.unseenNotifications,
                    seenNotifications: user.seenNotifications
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Internal Server Error", error });
    }
}));
router.post('/notifications/markoneread', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        else {
            const notification_message = req.body.notification_message;
            let unseenNotifications = user.unseenNotifications;
            let _notification = unseenNotifications.find((notification) => { return notification.message === notification_message; });
            unseenNotifications = unseenNotifications.filter((notification) => { return notification.message !== notification_message; });
            let seenNotifications = user.seenNotifications;
            if (_notification === null || _notification === void 0 ? void 0 : _notification.message)
                seenNotifications = [_notification, ...seenNotifications];
            yield userModel_1.userModel.findByIdAndUpdate(user._id, { unseenNotifications: unseenNotifications });
            yield userModel_1.userModel.findByIdAndUpdate(user._id, { seenNotifications: seenNotifications });
            user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
            return res.status(200).send({
                success: true,
                message: "Marked as read",
                data: {
                    unseenNotifications: user.unseenNotifications,
                    seenNotifications: user.seenNotifications
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Internal Server Error", error });
    }
}));
router.get('/notifications/deleteall', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        else {
            yield userModel_1.userModel.findByIdAndUpdate(user._id, { seenNotifications: [] });
            user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
            return res.status(200).send({
                success: true,
                message: "Successfully deleted all",
                data: {
                    seenNotifications: user.seenNotifications
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Internal Server Error", error });
    }
}));
router.post('/notifications/deleteone', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        else {
            const notification_message = req.body.notification_message;
            let seenNotifications = user.seenNotifications;
            seenNotifications = seenNotifications.filter((notification) => {
                return notification.message !== notification_message;
            });
            yield userModel_1.userModel.findByIdAndUpdate(user._id, { seenNotifications: seenNotifications });
            user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
            return res.status(200).send({
                success: true,
                message: "Successfully deleted",
                data: {
                    seenNotifications: user.seenNotifications
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Internal Server Error", error });
    }
}));
router.get('/getallapproveddoctors', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        else {
            const approvedDoctors = yield doctorModel_1.doctorModel.find({ status: "Approved" });
            return res.status(200).send({
                success: true,
                data: {
                    approvedDoctors: approvedDoctors,
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Eroor getting doctors", error });
    }
}));
router.get('/getallappointments', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        else {
            const currentDate = (0, moment_1.default)().format("DD-MM-YYYY");
            const appointments = yield appointmentModel_1.appointmentModel.find({ userid: user._id, date: { $gte: currentDate } });
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
        return res.status(500).send({ success: false, message: "Eroor getting appointments", error });
    }
}));
router.post('/cancelappointment', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (user.status === 'Blocked')
            return res.status(400).send({ message: "User is blocked", success: false });
        else {
            const appointment_id = req.body.appointment_id;
            const appointment = yield appointmentModel_1.appointmentModel.findById(appointment_id);
            if (!appointment)
                return res.status(400).send({ message: "Appoitnment does not exist", success: false });
            yield appointmentModel_1.appointmentModel.findByIdAndDelete(appointment_id);
            const doctoruserid = appointment.doctorInfo.userid;
            const doctoruser = yield userModel_1.userModel.findById(doctoruserid);
            if (!doctoruser)
                return res.status(400).send({ message: "doctor user account does not exist", success: false });
            let unseenNotifications = doctoruser.unseenNotifications;
            unseenNotifications = [{
                    type: "appointment-request-approved",
                    message: `${appointment.userInfo.name} has canceled appointment`,
                    data: {},
                    "onClickPath": "/protectedhome"
                }, ...unseenNotifications];
            yield userModel_1.userModel.findByIdAndUpdate(doctoruserid, { unseenNotifications: unseenNotifications });
            const appointments = yield appointmentModel_1.appointmentModel.find({ userid: appointment.userid });
            return res.status(200).send({
                success: true,
                message: "Appointment canceled successfully",
                data: {
                    appointments: appointments,
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Internal Server Error", error });
    }
}));
