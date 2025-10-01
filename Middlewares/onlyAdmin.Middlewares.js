
const apiError = require("../Services/apiError.Services.js");

async function restrictToAdmin(req, res, next) {
  try {
    if (!req.admin) {
      return res.status(403).json(
        new apiError(403, "Access Denied! Only Admin are allowed to access this route")
      );
    }
    next();
  } catch (error) {
    console.error("Error in restrictToAdmin middleware:", error);
    if (!res.headersSent) {
      return res.status(500).json(new apiError(500, "Server Error"));
    }
  }
}

module.exports = restrictToAdmin;
