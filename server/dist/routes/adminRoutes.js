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
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const authMiddleWare_1 = require("./authMiddleWare");
const userModel_1 = require("../models/userModel");
const doctorModel_1 = require("../models/doctorModel");
const router = require('express').Router();
exports.router = router;
router.get('/getallusers', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (!user.isAdmin)
            return res.status(400).send({ message: "Not a admin", success: false });
        else {
            const users = yield userModel_1.userModel.find({}, '-seenNotifications -unseenNotifications');
            return res.status(200).send({
                success: true,
                data: {
                    users: users,
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ success: false, message: "Error getting users", error });
    }
}));
router.get('/getalldoctors', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (!user.isAdmin)
            return res.status(400).send({ message: "Not a admin", success: false });
        else {
            const doctors = yield doctorModel_1.doctorModel.find({});
            return res.status(200).send({
                success: true,
                data: {
                    doctors: doctors,
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ success: false, message: "Error getting doctors", error });
    }
}));
router.post('/changeuserstatus', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (!user.isAdmin)
            return res.status(400).send({ message: "Not a admin", success: false });
        else {
            const status = req.body.status;
            const userid = req.body.userid;
            yield userModel_1.userModel.findByIdAndUpdate(userid, { status: status });
            const users = yield userModel_1.userModel.find({}, '-seenNotifications -unseenNotifications');
            return res.status(200).send({
                success: true,
                message: "Status successfully changed",
                data: {
                    users: users
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Internal Server Error", error });
    }
}));
router.post('/changedoctorstatus', authMiddleWare_1.authenticatejwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield userModel_1.userModel.findOne({ _id: req.headers.id });
        if (!user)
            return res.status(400).send({ message: "User does not exist", success: false });
        if (!user.isAdmin)
            return res.status(400).send({ message: "Not a admin", success: false });
        else {
            const userid = req.body.userid;
            const status = req.body.status;
            let isDoctor;
            if (status === "Approved") {
                isDoctor = true;
            }
            else {
                isDoctor = false;
            }
            const doctoruser = yield userModel_1.userModel.findById(userid);
            if (!doctoruser)
                return res.status(400).send({ message: "User account of doctor does not exist", success: false });
            yield doctorModel_1.doctorModel.findOneAndUpdate({ userid: userid }, {
                status: status,
            });
            const notification = {
                "type": "doctor-status-changed",
                "message": `Your account has been ${status}`,
                "data": {},
                "onClickPath": "/protectedhome"
            };
            doctoruser.unseenNotifications.push(notification);
            yield userModel_1.userModel.findByIdAndUpdate(userid, {
                unseenNotifications: doctoruser.unseenNotifications,
                isDoctor: isDoctor,
            });
            const doctors = yield doctorModel_1.doctorModel.find({});
            return res.status(200).send({
                success: true,
                message: "Status successfully changed",
                data: {
                    doctors: doctors,
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Internal Server Error", error });
    }
}));
