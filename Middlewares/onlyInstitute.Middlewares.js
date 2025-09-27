async function restrictToInstitute(req,res){
  if(!req.institute){
    return res.status(401).json(new apiError("You are not an Institute",401))
  } 
  next()
}

module.exports=restrictToInstitute