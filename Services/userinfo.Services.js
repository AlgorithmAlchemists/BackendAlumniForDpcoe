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

module.exports = getUserDetails;