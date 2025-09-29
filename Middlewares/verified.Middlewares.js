const supabase = require("../Connection.js");
const apiError = require("../Services/apiError.Services.js");
const getUserDetails = require("../Services/userinfo.Services.js");

async function verified(req, res, next) {
  try {
    const { receiver, sender } = req.body;

    // fetch details
    const receiverDetails = await getUserDetails(receiver);
    const senderDetails = await getUserDetails(sender);

    if (!receiverDetails || !senderDetails) {
      return res.status(404).json(apiError("User not found"));
    }

    if(!receiverDetails.isVerified || !senderDetails.isVerified){
      return res.status(403).json(apiError("Both users must be verified to send messages"));
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json(apiError("Internal server error"));
  }
}



module.exports = verified;
