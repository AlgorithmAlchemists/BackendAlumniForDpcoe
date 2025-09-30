const apiError = require("../Services/apiError.Services.js");

async function restrictToAlumni(req, res, next) {
  try {
    if (!req.alumni) {
      return res.status(403).json(
        new apiError(403, "Access Denied! Only Alumni are allowed to access this route")
      );
    }
    next();
  } catch (error) {
    console.error("Error in restrictToAlumni middleware:", error);
    if (!res.headersSent) {
      return res.status(500).json(new apiError(500, "Server Error"));
    }
  }
}

module.exports = restrictToAlumni;
