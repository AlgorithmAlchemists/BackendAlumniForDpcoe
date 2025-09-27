const JWT = require("jsonwebtoken")

const secreteKey = process.env.JWT_SECRETE_KEY

async function createToken(user) {
  if (user.role == "Institute") {
    const payload = {
      _id: user._id,
      Name: user.Name,
      role: user.role,
      email: user.email,
      website: user.website,

    }

    const token = await JWT.sign(payload, secreteKey, {
      expiresIn: '1d'
    })
    return token
  } else if (user.role == "Student") {
    const payload = {
      _id: user._id,
      fName: user.fName,
      lName: user.lName,
      email: user.email,
      currentYear: user.currentYear,
      instituteId: user.instituteId,
      isVerified: user.isVerified,
      role: user.role,
      dob: user.dob,
      gender: user.gender,


    }
    const token = await JWT.sign(payload, secreteKey, {
      expiresIn: '1d'
    })
    return token
  } else if (user.role == "Alumni") {
    const payload = {
      _id: user._id,
      fName: user.fName,
      lName: user.lName,
      email: user.email,
      instituteId: user.instituteId,
      isVerified: user.isVerified,
      role: user.role,
      dob: user.dob,
      gender: user.gender,


    }
    const token = await JWT.sign(payload, secreteKey, {
      expiresIn: '1d'
    })
    return token
  } else if (user.role == "Admin") {
    const payload = {
      _id: user.id,
      username: user.username,
      access:user.access,
      instituteId: user.instituteId,
      email: user.email,
      role: user.role,
    }
    const token = await JWT.sign(payload, secreteKey, {
      expiresIn: '1d'
    })
    return token
  }
}

function validateToken(token) {
  const payload = JWT.verify(token, secreteKey)
  return payload
}

module.exports = {
  createToken,
  validateToken
}