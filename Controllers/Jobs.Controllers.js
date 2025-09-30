// Controllers/Jobs.Controllers.js
const supabase = require("../Connection.js");
const apiResponse = require("../Services/apiResponse.Services.js");
const apiError = require("../Services/apiError.Services.js");

// Create a new job post (Alumni only)
async function createJobPost(req, res) {
  try {
    const { 
      jobURL, 
      title, 
      description, 
      company, 
      designation, 
      location, 
      typeOfJob 
    } = req.body;

    // Validate required fields
    if (!jobURL || !title || !description || !company || !designation || !location || !typeOfJob) {
      return res.status(400).json(new apiError(400, "All fields are required"));
    }

    // Validate typeOfJob enum
    const validJobTypes = ['Internship', 'FullTime', 'PartTime'];
    if (!validJobTypes.includes(typeOfJob)) {
      return res.status(400).json(new apiError(400, "Invalid job type. Must be Internship, FullTime, or PartTime"));
    }

    const { data, error } = await supabase
      .from('JobPost')
      .insert([{
        postedBy: req.alumni.id,
        jobURL,
        title,
        description,
        company,
        designation,
        location,
        typeOfJob,
        isOpen: true
      }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json(new apiError(400, error.message));
    }

    res.status(201).json(new apiResponse(201, "Job posted successfully", data));
  } catch (error) {
    console.error("Error in createJobPost:", error);
    res.status(500).json(new apiError(500, "Server Error"));
  }
}

// Get all active job posts
async function getAllJobPosts(req, res) {
  try {
    const { page = 1, limit = 10, typeOfJob, company, location } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('JobPost')
      .select(`
        *,
        Alumni:postedBy (
          fName,
          lName,
          currentCompany
        )
      `)
      .eq('isOpen', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (typeOfJob) {
      query = query.eq('typeOfJob', typeOfJob);
    }
    if (company) {
      query = query.ilike('company', `%${company}%`);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json(new apiError(400, error.message));
    }

    res.status(200).json(new apiResponse(200, "Jobs fetched successfully", data));
  } catch (error) {
    console.error("Error in getAllJobPosts:", error);
    res.status(500).json(new apiError(500, "Server Error"));
  }
}

// Get job post by ID
async function getJobPostById(req, res) {
  try {
    const { jobId } = req.params;

    const { data, error } = await supabase
      .from('JobPost')
      .select(`
        *,
        Alumni:postedBy (
          fName,
          lName,
          currentCompany
        )
      `)
      .eq('id', jobId)
      .single();

    if (error) {
      return res.status(404).json(new apiError(404, "Job post not found"));
    }

    res.status(200).json(new apiResponse(200, "Job post fetched successfully", data));
  } catch (error) {
    console.error("Error in getJobPostById:", error);
    res.status(500).json(new apiError(500, "Server Error"));
  }
}

// Update job post (Alumni who posted only)
async function updateJobPost(req, res) {
  try {
    const { jobId } = req.params;
    const updates = req.body;

    // Check if the job post belongs to the current alumni
    const { data: existingJob, error: fetchError } = await supabase
      .from('JobPost')
      .select('postedBy')
      .eq('id', jobId)
      .single();

    if (fetchError) {
      return res.status(404).json(new apiError(404, "Job post not found"));
    }

    if (existingJob.postedBy !== req.alumni.id) {
      return res.status(403).json(new apiError(403, "You can only update your own job posts"));
    }

    // Validate typeOfJob if provided
    if (updates.typeOfJob) {
      const validJobTypes = ['Internship', 'FullTime', 'PartTime'];
      if (!validJobTypes.includes(updates.typeOfJob)) {
        return res.status(400).json(new apiError(400, "Invalid job type"));
      }
    }

    const { data, error } = await supabase
      .from('JobPost')
      .update(updates)
      .eq('id', jobId)
      .select();

    if (error) {
      return res.status(400).json(new apiError(400, error.message));
    }

    res.status(200).json(new apiResponse(200, "Job post updated successfully", data));
  } catch (error) {
    console.error("Error in updateJobPost:", error);
    res.status(500).json(new apiError(500, "Server Error"));
  }
}

// Close job post (Alumni who posted only)
async function closeJobPost(req, res) {
  try {
    const { jobId } = req.params;

    // Check if the job post belongs to the current alumni
    const { data: existingJob, error: fetchError } = await supabase
      .from('JobPost')
      .select('postedBy')
      .eq('id', jobId)
      .single();

    if (fetchError) {
      return res.status(404).json(new apiError(404, "Job post not found"));
    }

    if (existingJob.postedBy !== req.alumni.id) {
      return res.status(403).json(new apiError(403, "You can only close your own job posts"));
    }

    const { data, error } = await supabase
      .from('JobPost')
      .update({ isOpen: false })
      .eq('id', jobId)
      .select();

    if (error) {
      return res.status(400).json(new apiError(400, error.message));
    }

    res.status(200).json(new apiResponse(200, "Job post closed successfully", data));
  } catch (error) {
    console.error("Error in closeJobPost:", error);
    res.status(500).json(new apiError(500, "Server Error"));
  }
}

// Get jobs posted by current alumni
async function getMyJobPosts(req, res) {
  try {
    const { data, error } = await supabase
      .from('JobPost')
      .select('*')
      .eq('postedBy', req.alumni.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json(new apiError(400, error.message));
    }

    res.status(200).json(new apiResponse(200, "Your job posts fetched successfully", data));
  } catch (error) {
    console.error("Error in getMyJobPosts:", error);
    res.status(500).json(new apiError(500, "Server Error"));
  }
}

module.exports = {
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  closeJobPost,
  getMyJobPosts
};