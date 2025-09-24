const supabase = require("../Connection.js");
const apiResponse = require("../Services/apiResponse.Services");

async function signUpInstitute(req, res) {
  try {
    const { Name, email, location } = req.body;
    const { data, error } = await supabase
      .from('Institute')
      .insert([{ Name, email, location }]);

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
