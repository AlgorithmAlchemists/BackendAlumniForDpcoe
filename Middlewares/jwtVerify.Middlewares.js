const { validateToken } = require("../Services/jwt.Services.js");
const apiError = require("../Utils/apiError.Services.js");

function checkToken(cookieName){
  return async function (req,res,next){
    let tokenValue = await req.cookies[cookieName]
    if (!tokenValue) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        tokenValue = authHeader.split(" ")[1];
      }
    }
    if(!tokenValue){
      return next()
    }
    try {
      
      const payload = validateToken(tokenValue)
      console.log("cookie got and in req.user")
      if(payload.role=="Admin"){
        req.admin=payload
        next()
      }else if(payload.role=="Institute"){
        req.institute=payload
        next()
      }else if(payload.role=="Student"){
        req.student=payload
        next()
      }else if(payload.role=="Alumni"){
        req.alumni=payload
        next()
      }else{
        return res.status(401).json(new apiError("Invalid Role",401))
      }
      
      
    } catch (error) {
      
    }
    next()
  }
}

module.exports = checkToken
//module.exports =checkToken;