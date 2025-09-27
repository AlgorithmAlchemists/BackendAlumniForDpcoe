const {createHmac, randomBytes}=require("crypto")

function haspassword(pass){
  const salt = randomBytes(16).toString()
  const hashedPassword = createHmac("sha256", salt).update(pass).digest("hex")

  return [salt,hashedPassword]
}

module.exports=haspassword;