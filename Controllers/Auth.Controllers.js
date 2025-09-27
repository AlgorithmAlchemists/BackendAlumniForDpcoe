const supabase = require("../Connection.js");
const apiResponse = require("../Services/apiResponse.Services");
const apiError = require("../Utils/apiError.Services.js");
const { haspassword, verifyPassword } = require("../Services/hashPassword.Services.js");
const createToken = require("../Services/jwt.Services.js");


async function signUpInstitute(req, res) {
  try {
    let { Name, email, location, website, pass } = req.body;
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
        instituteId: req.institute.id,
        password: hashPass[1],
        salt: hashPass[0]
      }]);

    // update this admin in institute table
    if (error) {
      return res.status(400).json(new apiError(error.message, 400))
    }

    const { data:d, error:e } = await supabase
      .from('Institute')
      .select('adminId')
      .eq('id', req.institute.id)
      .single()
    if (e) {
      return res.status(400).json(new apiError(e.message, 400))
    }
    let newAdminId = [...(d.adminId || []), data[0].id];



    const { data2, error2 } = await supabase
      .from('Institute')
      .update({
        adminId: newAdminId
      })
      .eq('id', req.institute.id)
    if (error2) {
      return res.status(400).json(new apiError(error2.message, 400))
    }
    res.status(201).json(new apiResponse(201, "Admin Created", data))

  } catch (error) {
    console.error(error);
   res.status(500).json(new apiError(500, "Server Error"));
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

async function alumniSignup(req, res) {
  try {
    let { fName, lName, email, pass, currentCompany, Dob, gradYear, gender, department, linkedin, instituteId } = req.body
    // lName is optional,  department is optional, linkedin is optional
    if (lName === undefined) {
      lName = null
    }
    if (department === undefined) {
      department = null
    }
    if (linkedin === undefined) {
      linkedin = null
    }

    if (!fName || !email || !pass || !currentCompany || !Dob || !gradYear || !gender || !instituteId) {
      return res.status(400).json(new apiError(400, "All feilds are required except last name, department and linkedin"))
    }

  // convert Dob to date
    Dob = new Date(Dob)
    if (isNaN(Dob.getTime())) {
      return res.status(400).json(new apiError(400, "Invalid Date of Birth"))
    }
    const hashPass = haspassword(pass)
    const { data, error } = await supabase
      .from('Alumni')
      .insert([{
        fName,
        lName: lName,
        email,
        password: hashPass[1],
        salt: hashPass[0],
        currentCompany,
        Dob,
        gradYear,
        gender,
        department: department,
        linkedin: linkedin,
        instituteId: instituteId
      }])
    if (error) {
      return res.status(400).json(new apiError(400, error.message))
    }
    res.status(201).json(new apiResponse(201, "Alumni Created", data))


  } catch (error) {
    console.error(error)
    res.status(500).json(new apiError(500, "Server Error"))
  }
}

// function for alumni login
async function signinAlumni(req, res) {
  try {
    const { email, pass } = req.body
    const { data, error } = await supabase
      .from('Alumni')
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
      .from('Alumni')
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

// now creating controller for student login and signup
async function signupStudent(req, res) {
  try {
    let { fName, lName, email, pass, Dob, currentYear, department, instituteId, gender } = req.body
    // lName is optional
    if (lName === undefined) {
      lName = null
    }
    if (!fName || !email || !pass || !Dob || !currentYear || !instituteId || !department || !gender) {
      return res.status(400).json(new apiError(400, "All feilds are required except last name"))
    }
    // convert Dob to date
    Dob = new Date(Dob)
    if (isNaN(Dob.getTime())) {
      return res.status(400).json(new apiError(400, "Invalid Date of Birth"))
    }
    const hashPass = haspassword(pass)
    const { data, error } = await supabase
      .from('Student')
      .insert([{
        fName,
        lName: lName,
        email,
        password: hashPass[1],
        salt: hashPass[0],
        Dob,
        currentYear,
        department,
        instituteId,
        gender
      }])
    if (error) {
      return res.status(400).json(new apiError(400, error.message))
    }
    res.status(201).json(new apiResponse(201, "Student Created", data))

  } catch (error) {
    console.error(error)
    res.status(500).json(new apiError(500, "Server Error"))
  }
}

async function signinStudent(req, res) {
  try {
    const { email, pass } = req.body
    const { data, error } = await supabase
      .from('Student')
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
      .from('Student')
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

module.exports = { signUpInstitute, loginInstitute, createAdmin, loginAdmin, alumniSignup, signinAlumni, signupStudent, signinStudent };
