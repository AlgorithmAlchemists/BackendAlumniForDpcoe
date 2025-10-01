const express = require("express");
const { getUnverifiedUsers, verifyUsers } = require("../Controllers/Admin.Controllers");
const { 
  createEvent, 
  updateEvent, 
  deleteEvent, 
} = require("../Controllers/Events.Controllers");
const restrictToAdmin = require("../Middlewares/onlyAdmin.Middlewares");


const router = express.Router();


router.get("/un-verified-users",restrictToAdmin,getUnverifiedUsers)
router.patch("/verify-user/:id",restrictToAdmin,verifyUsers)


// Event management routes
router.post("/events/create", restrictToAdmin, createEvent);
router.put("/events/update/:eventId", restrictToAdmin, updateEvent);
router.delete("/events/delete/:eventId", restrictToAdmin, deleteEvent);



module.exports = router;