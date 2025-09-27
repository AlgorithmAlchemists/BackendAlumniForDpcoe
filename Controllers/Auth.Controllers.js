const supabase = require("../Connection.js");
const apiResponse = require("../Services/apiResponse.Services");
const apiError = require("../Utils/apiError.Services.js");
const { haspassword, verifyPassword } = require("../Services/hashPassword.Services.js");


async function signUpInstitute(req, res) {
  try {
    const { Name, email, location, website, pass } = req.body;
    if (!website) {
      website = null
    }

    const hashPass = haspassword(pass)


    const { data, error } = await supabase
      .from('Institute')
      .insert([{
        Name,
        email,
        website,
        location,
        password: hashPass[1],
        salt: hashPass[0]
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

async function loginInstitute(req, res) {
  try {
    const { email, pass } = req.body
    const { data, error } = await supabase
      .from('Institute')
      .select('password,salt')
      .eq('email', email)
      .single();
    if (error) {
      return res.status(400).json(new apiError(400, "Invalid Email"))
    }
    const isValid = verifyPassword(data.salt, data.password, pass)
    if (!isValid) {
      return res.status(400).json(new apiError(400, "Invalid Password"))
    }
    const { data2, error2 } = await supabase
      .from('Institute')
      .select('*')
      .eq('email', email)
      .single();
    const token = await createToken(data2)
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    }).status(200).json(new apiResponse(200, "Login Success", token))



  } catch (error) {
    console.error(error)
    res.status(500).json(new apiError(500, "Server Error"))
  }
}

async function createAdmin(req, res) {
  try {
    const { username, email, pass, access } = req.body
    // check if all feilds are present
    if (!username || !email || !pass || !access) {
      return res.status(400).json(new apiError("All feilds are required", 400))
    }
    // create hash and salt
    const hashPass = haspassword(pass)
    // insert admin in db
    const { data, error } = await supabase
      .from('Admin')
      .insert([{
        username,
        email,
        access, // array of access like ["manageUsers","viewReports"]
        instituteId: req.institute._id,
        password: hashPass[1],
        salt: hashPass[0]
      }]);

    // update this admin in institute table
    if (error) {
      return res.status(400).json(new apiError(error.message, 400))
    }

    const { d, e } = await supabase
      .from('Institute')
      .select('adminId')
      .eq('_id', req.institute._id)
      .single()
    if (e) {
      return res.status(400).json(new apiError(e.message, 400))
    }
    let newAdminId = d.push(data[0]._id)

    const { data2, error2 } = await supabase
      .from('Institute')
      .update({
        adminId: newAdminId
      })
      .eq('_id', req.institute._id)
    if (error2) {
      return res.status(400).json(new apiError(error2.message, 400))
    }
    res.status(201).json(new apiResponse(201, "Admin Created", data))

  } catch (error) {

  }
}

async function loginAdmin(req, res) {
  try {
    const { email, pass } = req.body
    const { data, error } = await supabase
      .from('Admin')
      .select('password,salt')
      .eq('email', email)
      .single();
    if (error) {
      return res.status(400).json(new apiError(400, "Invalid Email"))
    }
    const isValid = verifyPassword(data.salt, data.password, pass)
    if (!isValid) {
      return res.status(400).json(new apiError(400, "Invalid Password"))
    }
    const { data2, error2 } = await supabase
      .from('Admin')
      .select('*')
      .eq('email', email)
      .single();
    const token = await createToken(data2)
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    }).status(200).json(new apiResponse(200, "Login Success", token))
  } catch (error) {
    console.error(error)
    res.status(500).json(new apiError(500, "Server Error"))
  }
}

module.exports = { signUpInstitute, loginInstitute, createAdmin, loginAdmin };
