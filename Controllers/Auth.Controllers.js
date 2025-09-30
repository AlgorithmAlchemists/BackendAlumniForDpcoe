const supabase = require("../Connection.js");
const apiResponse = require("../Services/apiResponse.Services");
const apiError = require("../Services/apiError.Services.js");
const { haspassword, verifyPassword } = require("../Services/hashPassword.Services.js");
const {createToken} = require("../Services/jwt.Services.js");


async function signUpInstitute(req, res) {
  try {
    let { name, email, location, website, pass } = req.body;
    if (!website) {
      website = null
    }

    const hashPass = haspassword(pass)


    const { data, error } = await supabase
      .from('Institute')
      .insert([{
        name,
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
    const { data:data2, error:error2 } = await supabase
      .from('Institute')
      .select('*')
      .eq('email', email)
      .single();
      console.log(data2);
      console.error(error2);
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

// async function createAdmin(req, res) {
//   try {
//     const { username, email, pass, access } = req.body;

//     // 1. Check if all fields are present
//     if (!username || !email || !pass || !access) {
//        res.status(400).json(new apiError("All fields are required", 400));
//        return
//     }
//       console.log('bfr hash');
//     // 2. Create hash and salt
//     const hashPass = haspassword(pass);

//     const accessArr = Array.isArray(access) ? access : [access];

//     // 3. Insert admin in db
//     const { data: adminData, error: adminError } = await supabase
//       .from("Admin")
//       .insert([{
//         username,
//         email,
//         access:accessArr, // e.g. ["manageUsers","viewReports"]
//         // instituteId: req.institute.id,
//         password: hashPass[1],
//         salt: hashPass[0],
//       }])
//       .select()
//       .single(); // ensures we get inserted row directly
//       console.log('after insertion', adminData, adminError);
//       if (adminError) {
//         res.status(400).json(new apiError(adminError.message, 400));
//         return 
//       }
      
//       // 4. Get current admin list from Institute
//       const { data: instituteData, error: instituteError } = await supabase
//       .from("Institute")
//       .select("admins")
//       .eq("id", req.institute.id)
//       .single();
      
      
//       console.log('after geting institute', instituteData, instituteError);
      
//       if (instituteError) {
//         res.status(400).json(new apiError(instituteError.message, 400));
//          return
//       }
      
//       // 5. Append new adminId
//       const newAdminId = [...(instituteData.admins || []), adminData.id]; // corrected property

// const { error: updateError } = await supabase
//   .from("Institute")
//   .update({ admins: newAdminId })
//   .eq("id", req.institute.id);

// if (updateError) {
//   return res.status(400).json(new apiError(updateError.message, 400));
// }

// // Send success response
// return res.status(201).json(new apiResponse(201, "Admin Created", adminData));

//   } catch (error) {
//     console.error(error);
//     res.status(500).json(new apiError(500, "Server Error"));
//     return
//   }
// }

async function createAdmin(req, res) {
  if (!req.institute || !req.institute.id) {
    return res.status(403).json(new apiError(403, "Forbidden: Invalid Institute"));
  }

  try {
    const { username, email, pass, access } = req.body;

    if (!username || !email || !pass || !access) {
      return res.status(400).json(new apiError(400, "All fields are required"));
    }

    console.log('Before hashing password');

    // Hash password
    const [salt, hashed] = haspassword(pass);
    const accessArr = Array.isArray(access) ? access : [access];

    console.log('After hashing password');

    // Insert Admin
    const { data: adminData, error: adminError } = await supabase
      .from("Admin")
      .insert([{ username, email, access: accessArr, password: hashed, salt, instituteId: req.institute.id }])
      .select()
      // .single();

    console.log('After inserting admin', adminData, adminError);

    if (adminError) {
      return res.status(400).json(new apiError(adminError.message, 400));
    }

    // Success response
    return res.status(201).json({
      message: "Admin Created",
      status: 201,
      data: adminData
    });

  } catch (error) {
    console.error("Server error in createAdmin:", error);
    // Only send response if none has been sent
    if (!res.headersSent) {
      return res.status(500).json(new apiError(500, "Server Error"));
    }
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
    const { data: data2, error: error2 } = await supabase
      .from('Alumni')
      .select('*')
      .eq('email', email)
      .single();

      //// This is required for the generic createToken service to correctly structure the JWT payload.
    const user = { ...data2, role: "Alumni" };
    
    const token = await createToken(user)
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
