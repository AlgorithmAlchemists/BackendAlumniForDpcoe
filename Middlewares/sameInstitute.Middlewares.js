const supabase = require("../Connection.js");
const apiError = require("../Services/apiError.Services.js");

async function sameInstitute(req, res, next) {
  try {
    const { receiver, sender } = req.body;

    // fetch details
    const receiverDetails = await getUserDetails(receiver);
    const senderDetails = await getUserDetails(sender);

    if (!receiverDetails || !senderDetails) {
      return res.status(404).json(apiError("User not found"));
    }

    // check same institute
    if (receiverDetails.instituteId !== senderDetails.instituteId) {
      return res.status(403).json(apiError("Users belong to different institutes"));
    }

    // attach to request for further use
    req.receiverId = receiverDetails;
    req.senderId = senderDetails;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json(apiError("Internal server error"));
  }
}

async function getUserDetails(id) {
  const tables = [
    { name: "Students", fields: "id, instituteId" },
    { name: "Alumni", fields: "id, instituteId" }
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

module.exports = sameInstitute;
