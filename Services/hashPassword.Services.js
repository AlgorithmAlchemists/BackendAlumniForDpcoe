const {createHmac, randomBytes}=require("crypto")

function haspassword(pass){
  const salt = randomBytes(16).toString()
  const hashedPassword = createHmac("sha256", salt).update(pass).digest("hex")

  return [salt,hashedPassword]
}

function verifyPassword(savedSalt,savedHash,passToVerify){
  const hashToVerify = createHmac("sha256", savedSalt).update(passToVerify).digest("hex")
  return savedHash === hashToVerify
}

module.exports={haspassword,verifyPassword}