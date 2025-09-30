const supabase = require("../Connection.js");
const apiError = require("../Services/apiError.Services.js");
const getUserDetails = require("../Services/userinfo.Services.js");

async function sameInstitute(req, res, next) {
  try {
    // console.log("Middleware sameInstitute invoked");
    const { receiver, sender } = req.body;

    // fetch details
    const receiverDetails = await getUserDetails(receiver);
    const senderDetails = await getUserDetails(sender);

    if (!receiverDetails || !senderDetails) {
      return res.status(404).json(apiError("User not found"));
    }

    // check same institute
    if (receiverDetails.instituteId !== senderDetails.instituteId) {
      return res.status(403).json(apiError("Users belong to different institutes"));
    }

    // attach to request for further use
    req.body.receiverId = receiverDetails;
    req.body.senderId = senderDetails;
    req.body.instituteId = senderDetails.instituteId;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json(apiError(500,"Internal server error"));
  }
}


module.exports = sameInstitute;
