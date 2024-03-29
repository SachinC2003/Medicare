"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatejwt = void 0;
const jwt = require('jsonwebtoken');
const authenticatejwt = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        const { id } = jwt.verify(token, process.env.JWTPRIVATEKEY);
        req.headers.id = id;
        next();
    }
    catch (err) {
        console.log(err);
        return res.status(401).send({ success: false, error: err, message: "Authentication failed" });
    }
};
exports.authenticatejwt = authenticatejwt;
