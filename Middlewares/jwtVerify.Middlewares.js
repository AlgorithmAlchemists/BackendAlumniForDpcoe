// filepath: Middlewares/jwtVerify.Middlewares.js
const { validateToken } = require("../Services/jwt.Services.js");
const apiError = require("../Services/apiError.Services.js");

function checkToken(cookieName) {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1] || req.cookies[cookieName];
      if (!token) {
        next();
        return;
      }

      const decoded = validateToken(token);

      // Attach user/institute/admin based on role
      switch (decoded.role) {
        case "Institute":
          req.institute = decoded;
          break;
        case "Admin":
          req.admin = decoded;
          break;
        case "Student":
          req.student = decoded;
          break;
        case "Alumni":
          req.alumni = decoded;
          break;
        default:
          return res.status(403).json(new apiError(403, "Invalid role"));
      }

      next();
    } catch (err) {
      if (!res.headersSent) {
        return res.status(401).json(new apiError(401, "Invalid or expired token"));
      }
    }
  };
}

module.exports = checkToken;
