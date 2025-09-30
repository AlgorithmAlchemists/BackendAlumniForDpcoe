const express = require("express");
const {
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  closeJobPost,
  getMyJobPosts
} = require('../Controllers/Jobs.Controllers.js');
const restrictToAlumni = require("../Middlewares/onlyAlumni.Middlewares.js");

const router = express.Router();

// Job posting routes (Alumni only)
router.post('/create', restrictToAlumni, createJobPost);
router.get('/my-posts', restrictToAlumni, getMyJobPosts);
router.put('/update/:jobId', restrictToAlumni, updateJobPost);
router.patch('/close/:jobId', restrictToAlumni, closeJobPost);

// Job viewing routes (All authenticated users)
router.get('/all', getAllJobPosts);
router.get('/details/:jobId', getJobPostById);

module.exports = router;