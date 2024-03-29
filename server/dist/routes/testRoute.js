"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const router = require('express').Router();
exports.router = router;
router.get('/', (req, res) => {
    return res.status(200).send({
        success: true,
        message: "Server is woring",
    });
});
