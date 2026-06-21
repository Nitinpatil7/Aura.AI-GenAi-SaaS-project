const express = require("express");
const router = express.Router();

const paymentController = require("../controller/paymentcontroller");
const authMiddleware = require("../middlewere/authmiddlewere");

// Create Razorpay Order
router.post("/createorder", authMiddleware, paymentController.createorder);

// Verify Payment
router.post("/verifypayment", authMiddleware, paymentController.verifypayment);

module.exports = router;