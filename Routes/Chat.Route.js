const express = require("express");
const { sendMessage, getConversations, getAllMessages, createNewConversation, deleteMessage } = require("../Controllers/Chat.Controllers.js");
const sameInstitute = require("../Middlewares/sameInstitute.Middlewares.js");
const upload = require("../Middlewares/multer.Middlewares.js");
const {verified, singleVerified} = require("../Middlewares/verified.Middlewares.js");
const sameInstituteAndSameTable = require("../Middlewares/sameInstituteAndSameTable.Middlewares.js");

const router = express.Router();


router.post("/send", sameInstitute, verified, upload.single('file'), sendMessage);
router.get("/conversations", verified, getConversations);
router.get("/messages/:conversationid", verified, getAllMessages);
router.post("/create-new/conversation",sameInstituteAndSameTable,createNewConversation);
router.patch("/mark-as-read/:conversationid", singleVerified, markMessagesAsRead);
router.delete("/delete-message/:messageid", singleVerified, deleteMessage);


module.exports = router;