const express = require("express");
const { getUnverifiedUsers, verifyUsers } = require("../Controllers/Admin.Controllers");
const restrictToAdmin = require("../Middlewares/onlyAdmin.Middlewares");


const router = express.Router();


router.get("/un-verified-users",restrictToAdmin,getUnverifiedUsers)
router.patch("/verify-user/:id",restrictToAdmin,verifyUsers)


module.exports = router;