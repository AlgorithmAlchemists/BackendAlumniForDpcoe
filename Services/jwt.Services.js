const JWT = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRETE_KEY;

// Create token for any role
function createToken(user) {
  let payload = {};

  switch (user.role) {
    case "Institute":
      payload = {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        website: user.website,
      };
      break;

    case "Student":
    case "Alumni":
      payload = {
        id: user.id,
        fName: user.fName,
        lName: user.lName,
        email: user.email,
        instituteId: user.instituteId,
        isVerified: user.isVerified,
        role: user.role,
        dob: user.dob,
        gender: user.gender,
        ...(user.role === "Student" ? { currentYear: user.currentYear } : {}),
      };
      break;

    case "Admin":
      payload = {
        id: user.id,
        username: user.username,
        access: user.access,
        instituteId: user.instituteId,
        email: user.email,
        role: user.role,
      };
      break;

    default:
      throw new Error("Invalid user role for JWT creation");
  }

  return JWT.sign(payload, secretKey, { expiresIn: "1d" });
}

// Validate token safely
function validateToken(token) {
  try {
    return JWT.verify(token, secretKey);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}

module.exports = {
  createToken,
  validateToken,
};
