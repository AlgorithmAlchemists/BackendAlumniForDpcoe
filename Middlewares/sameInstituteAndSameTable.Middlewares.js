// const supabase = require("../Connection.js");
const apiError = require("../Services/apiError.Services.js");
const getUserDetails = require("../Services/userinfo.Services.js");

async function sameInstituteAndSameTable(req, res, next) {
  try {
    const creator = req.alumni || req.student;
    const creatorInstitute = req.alumni?.instituteId || req.student?.instituteId;
    if (!creator || !creator.isverified) {
      return res.status(400).json(new apiError(400, "User institute not found or not verified"));
    }

    const participants = req.body.participants;

    if (!Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json(new apiError(400, "Participants must include at least 2 users"));
    }

    for (const participant of participants) {
      const participantDetails = await getUserDetails(participant);

      if (!participantDetails) {
        return res.status(404).json(new apiError(404, "User not found"));
      }

      if (participantDetails.instituteId !== creatorInstitute) {
        return res.status(403).json(new apiError(403, "Users belong to different institutes"));
      }

      if (participantDetails.role !== creator.role) {
        return res.status(403).json(new apiError(403, "Users belong to different roles"));
      }

      if (!participantDetails.isverified) {
        return res.status(403).json(new apiError(403, "User is not verified"));
      }
    }

    // ✅ All participants passed validation
    next();

  } catch (error) {
    console.error(error);
    res.status(500).json(new apiError(500, "Internal server error"));
  }
}

module.exports = sameInstituteAndSameTable;
