const express = require("express");
const router = express.Router();

const {  getDashboard , getAllImages } = require("../controller/dashboardcontroller");

const auth = require("../middlewere/authmiddlewere");

router.get("/user", auth, getDashboard);
router.get("/image" , auth , getAllImages)

module.exports = router;