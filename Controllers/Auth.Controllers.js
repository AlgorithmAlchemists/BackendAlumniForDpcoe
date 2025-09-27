const supabase = require("../Connection.js");
const apiResponse = require("../Services/apiResponse.Services");
const haspassword = require("../Services/hashPassword.Services.js");


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

module.exports = signUpInstitute;
