const express = require("express");
const {getAllEvents} = require("../Controllers/Events.Controllers");
const router = express.Router();

// Public event viewing routes (can be accessed by authenticated users)
router.get("/all", getAllEvents);

module.exports = router;