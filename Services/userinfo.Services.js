const supabase = require("../Connection.js");

async function getUserDetails(id) {
  const tables = [
    { name: "Student", fields: "id, instituteId, isverified" },
    { name: "Alumni", fields: "id, instituteId, isverified" }
  ];
// console.log("Fetching user details for ID:", id);
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table.name)
      .select(table.fields)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    // console.log(`Checked table ${table.name}:`, data);
    if (data) return { ...data, table: table.name }; // include table name
  }
//  console.log("User not found in any table");
  return null;
}

module.exports = getUserDetails;