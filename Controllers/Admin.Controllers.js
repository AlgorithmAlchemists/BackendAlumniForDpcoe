const apiError = require("../Services/apiError.Services");
const apiResponse = require("../Services/apiResponse.Services");


async function getUnverifiedUsers(req, res) {
  try {
    const access = req.admin.access;
    const hasAccess = checkAdminAccess(access, 'verifyUsers');
    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden: You don't have access to verify users" });
    }
    //fetch all users from the database whose isVerified field is false
    const { data: unverifiedUsersStudents, error } = await supabase
      .from('Student')
      .select('*')
      .eq('isverified', false);
    const { data: unverifiedUsersAlumni, error:errorAlumni } = await supabase
      .from('Alumni')
      .select('*')
      .eq('isverified', false);
    if (error || errorAlumni) {
      return res.status(500).json({ message: "Internal Server Error", error: [error.message, errorAlumni.message] });
    }
    const unverifiedUsers = [...unverifiedUsersStudents, ...unverifiedUsersAlumni];
    return res.status(200).json(new apiResponse(200, "Unverified users fetched successfully", { unverifiedUsers }));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiError(500, "Internal Server Error", error));
  }
}


async function verifyUsers(req, res) {
  try {
    const access = req.admin.access;
    const hasAccess = checkAdminAccess(access, 'verifyUsers');
    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden: You don't have access to verify users" });
    }
    const userid = req.params.id;
    if (!userid) {
      return res.status(400).json(new apiError(400, "User ID is required"));
    }
    const userdetails = await getUserDetails(userid);
    if (!userdetails) {
      return res.status(404).json(new apiError(404, "User not found"));
    }

    //update the isVerified field to true for the user with the given id
    switch (userdetails.role) {
      case 'Student':
        const { data: student, error: studentError } = await supabase
          .from('Student')
          .update({ isverified: true })
          .eq('id', userid);
        if (studentError) {
          return res.status(500).json(new apiError(500, "Internal Server Error", studentError));
        }
        return res.status(200).json(new apiResponse(200, "User verified successfully", { student }));
        
      case 'Alumni':
        const { data: alumni, error: alumniError } = await supabase
          .from('Alumni')
          .update({ isverified: true })
          .eq('id', userid);
        if (alumniError) {
          return res.status(500).json(new apiError(500, "Internal Server Error", alumniError));
        }
        return res.status(200).json(new apiResponse(200, "User verified successfully", { alumni }));
        
      default:
        return res.status(400).json(new apiError(400, "Invalid user role"));
        
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiError(500, "Internal Server Error", error));
  }
}


module.exports = { getUnverifiedUsers, verifyUsers };