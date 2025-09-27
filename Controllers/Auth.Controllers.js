const supabase = require("../Connection.js");
const apiResponse = require("../Services/apiResponse.Services");
const apiError = require("../Utils/apiError.Services.js");
const {haspassword, verifyPassword} = require("../Services/hashPassword.Services.js");


async function signUpInstitute(req, res) {
  try {
    const { Name, email, location, website, pass  } = req.body;
    if(!website){
      website=null
    }
    
    const hashPass=haspassword(pass)


    const { data, error } = await supabase
      .from('Institute')
      .insert([{
        Name,
        email,
        website,
        location,
        password:hashPass[1],
        salt:hashPass[0]
       }]);
      

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json(new apiResponse(400, "error", error.message));
    }

    res.status(201).json(new apiResponse(201, "success", data));
  } catch (err) {
    console.error(err);
    res.status(500).json(new apiResponse(500, "server error", err.message));
  }
}

async function loginInstitute(req,res){
  try {
    const {email,pass} = req.body   
    const {data,error} = await supabase
    .from('Institute')
    .select('password,salt')
    .eq('email', email)
    .single();
    if(error){ 
      return res.status(400).json(new apiError(400,"Invalid Email")) 
    }
    const isValid = verifyPassword(data.salt,data.password,pass)
    if(!isValid){
      return res.status(400).json(new apiError(400,"Invalid Password"))
    }
    const {data2,error2} = await supabase
    .from('Institute')
    .select('*')
    .eq('email', email)
    .single();
    const token = await createToken(data2)
    res.cookie("token",token,{
      httpOnly:true, 
      sameSite:"lax",
      maxAge:24*60*60*1000 
    }).status(200).json(new apiResponse(200,"Login Success",token))


    
  } catch (error) { 
    console.error(error)
    res.status(500).json(new apiError(500,"Server Error"))
  }
}


module.exports = {signUpInstitute, loginInstitute};
