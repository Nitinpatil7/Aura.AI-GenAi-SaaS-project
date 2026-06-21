const express = require("express");
const router = express.Router();


const{ getDashboardStats }= require("../controller/admin/dashboardcontroller");
const {getUserStats} = require("../controller/admin/usercontroller");
const {getBillingStats} = require("../controller/admin/billingcontroller");
const {getUsersList} = require("../controller/admin/usercontroller");
 const content = require("../controller/admin/contentcontroller");


const auth = require("../middlewere/authmiddlewere");
const admin = require("../middlewere/adminmiddlewere");


router.get("/dashboard", auth, admin,getDashboardStats);


router.get("/userstate", auth, admin, getUserStats);
router.get("/userslist", auth, admin, getUsersList);

router.get("/billing", auth, admin, getBillingStats);

 router.get("/content", auth, admin, content.getContentStats);

module.exports = router;