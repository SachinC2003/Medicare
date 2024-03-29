"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidate = exports.loginValidate = exports.generateAuthToken = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isDoctor: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: "Ok"
    },
    seenNotifications: {
        type: Array,
        default: [],
    },
    unseenNotifications: {
        type: Array,
        default: [],
    },
}, {
    timestamps: true
});
exports.userModel = mongoose_1.default.model("users", userSchema);
const generateAuthToken = function (id) {
    const token = jsonwebtoken_1.default.sign({ id }, process.env.JWTPRIVATEKEY);
    return token;
};
exports.generateAuthToken = generateAuthToken;
const loginValidate = (data) => {
    const schema = joi.object({
        email: joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password")
    });
    return schema.validate(data);
};
exports.loginValidate = loginValidate;
const registerValidate = (data) => {
    const schema = joi.object({
        name: joi.string().required().label("Name"),
        email: joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password")
    });
    return schema.validate(data);
};
exports.registerValidate = registerValidate;
