"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(process.env.MONGO_URL);
mongoose_1.default.connection.on('connected', () => {
    console.log('Connected to the database successfully');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error(`Database connection error: ${err}`);
});
exports.default = mongoose_1.default.connection;
