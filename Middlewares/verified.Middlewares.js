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

    if(!receiverDetails.isverified || !senderDetails.isverified){
      return res.status(403).json(new apiError(403,"Both users must be verified to send messages"));
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json(new apiError(500,"Internal server error"));
  }
}

async function singleVerified(req,res,next){
  try {
    const userId = req.alumni.id || req.student.id || req.admin.id;
    req.role = req.alumni.role || req.student.role || req.admin.role;
    if(!userId){
      return res.status(400).json(new apiError(400,"Invalid user"));
    }
    if(req.role == 'admin'){
      return next();
    }
    const userDetails = await getUserDetails(userId);
    req.user = userDetails;
    if(!userDetails || !userDetails.isverified){
      return res.status(403).json(new apiError(403,"User not verified"));
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json(new apiError(500,"Internal server error"))
  }
}



module.exports = {verified, singleVerified};
