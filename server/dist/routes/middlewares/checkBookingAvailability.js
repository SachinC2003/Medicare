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
exports.checkBookingAvailabilty = void 0;
const moment_1 = __importDefault(require("moment"));
const appointmentModel_1 = require("../../models/appointmentModel");
const doctorModel_1 = require("../../models/doctorModel");
const checkBookingAvailabilty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = (0, appointmentModel_1.appointmentValidation)(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message, success: false });
        const date = (0, moment_1.default)(req.body.date, "DD-MM-YYYY");
        const fromTime = (0, moment_1.default)(req.body.time, "HH:mm").subtract(30, 'minutes');
        const toTime = (0, moment_1.default)(req.body.time, "HH:mm").add(30, 'minutes');
        const currentDateTime = (0, moment_1.default)();
        if (date.isBefore(currentDateTime, 'day'))
            return res.status(400).send({ message: "Requested date is in the past.", success: false });
        if (date.isSame(currentDateTime, 'day') && fromTime.isBefore(currentDateTime, 'minute'))
            return res.status(400).send({ message: "Requested time is in the past.", success: false });
        if (date.isSame(currentDateTime, 'day') && toTime.isBefore(currentDateTime, 'minute'))
            return res.status(400).send({ message: "Requested time is in the past.", success: false });
        const doctorid = req.body.doctorid;
        const doctor = yield doctorModel_1.doctorModel.findById(doctorid);
        if (req.body.time > (doctor === null || doctor === void 0 ? void 0 : doctor.timings[1]) || req.body.time < (doctor === null || doctor === void 0 ? void 0 : doctor.timings[0]))
            return res.status(400).send({ message: "Booking slot not available in doctor's timings", success: false });
        const userAppointments = yield appointmentModel_1.appointmentModel.find({
            doctorid: doctorid,
            userid: req.body.userid,
            date: date.format("DD-MM-YYYY"),
        });
        if (userAppointments.length !== 0)
            return res.status(400).send({ message: "You can not book more than one appointment of same doctor in a day.", success: false });
        const appointments = yield appointmentModel_1.appointmentModel.find({
            doctorid: doctorid,
            date: date.format("DD-MM-YYYY"),
            time: { $gte: fromTime.format("HH:mm"), $lte: toTime.format("HH:mm") },
            status: 'Approved'
        });
        if (appointments.length !== 0)
            return res.status(400).send({ message: "Booking slot not available, try some different time", success: false });
        next();
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ success: false, error: err, message: "Error booking appointment" });
    }
});
exports.checkBookingAvailabilty = checkBookingAvailabilty;
