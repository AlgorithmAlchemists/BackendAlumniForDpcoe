const express = require("express");
const { sendMessage, getConversations, getAllMessages } = require("../Controllers/Chat.Controllers.js");
const sameInstitute = require("../Middlewares/sameInstitute.Middlewares.js");
const upload = require("../Middlewares/multer.Middlewares.js");
const verified = require("../Middlewares/verified.Middlewares.js");

const router = express.Router();


router.post("/send", sameInstitute, verified, upload.single('file'), sendMessage);
router.get("/conversations", verified, getConversations);
router.get("/messages/:conversationid", verified, getAllMessages);


module.exports = router;