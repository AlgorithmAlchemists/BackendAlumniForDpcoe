const supabase = require("../Connection.js");
const apiError = require("../Services/apiError.Services.js");

async function verified(req, res, next) {
  try {
    const { receiver, sender } = req.body;

    // fetch details
    const receiverDetails = await getUserDetails(receiver);
    const senderDetails = await getUserDetails(sender);

    if (!receiverDetails || !senderDetails) {
      return res.status(404).json(apiError("User not found"));
    }

    if(!receiverDetails.isVerified || !senderDetails.isVerified){
      return res.status(403).json(apiError("Both users must be verified to send messages"));
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json(apiError("Internal server error"));
  }
}

async function getUserDetails(id) {
  const tables = [
    { name: "Students", fields: "id, instituteId, isVerified" },
    { name: "Alumni", fields: "id, instituteId, isVerified" }    
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table.name)
      .select(table.fields)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (data) return { ...data, table: table.name }; // include table name
  }

  return null;
}

module.exports = verified;
