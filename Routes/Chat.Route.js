const express = require("express");
const { sendMessage, getConversations, getAllMessages, createNewConversation } = require("../Controllers/Chat.Controllers.js");
const sameInstitute = require("../Middlewares/sameInstitute.Middlewares.js");
const upload = require("../Middlewares/multer.Middlewares.js");
const verified = require("../Middlewares/verified.Middlewares.js");
const sameInstituteAndSameTable = require("../Middlewares/sameInstituteAndSameTable.Middlewares.js");

const router = express.Router();


router.post("/send", sameInstitute, verified, upload.single('file'), sendMessage);
router.get("/conversations", verified, getConversations);
router.get("/messages/:conversationid", verified, getAllMessages);
router.post("/create-new/conversation",sameInstituteAndSameTable,createNewConversation);


module.exports = router;