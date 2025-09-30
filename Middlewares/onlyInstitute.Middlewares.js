const apiError = require("../Services/apiError.Services.js");

async function restrictToInstitute(req, res, next) {
  try {
    if (!req.institute) {
      return res.status(403).json(
        new apiError(403, "Access Denied! Only Institute is allowed to access this route")
      );
    }
    next();
  } catch (error) {
    console.error("Error in restrictToInstitute middleware:", error);
    if (!res.headersSent) {
      return res.status(500).json(new apiError(500, "Server Error"));
    }
  }
}

module.exports = restrictToInstitute;
