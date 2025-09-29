const express = require("express");
const { sendMessage } = require("../Controllers/Chat.Controllers.js");
const sameInstitute = require("../Middlewares/sameInstitute.Middlewares.js");
const upload = require("../Middlewares/multer.Middlewares.js");
const verified = require("../Middlewares/verified.Middlewares.js");

const router = express.Router();


router.post("/send",sameInstitute,verified,upload.single('file'),sendMessage);


module.exports = router;