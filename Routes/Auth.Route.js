const express = require("express");
const {signUpInstitute, loginInstitute, createAdmin, loginAdmin, alumniSignup, signinAlumni} = require('../Controllers/Auth.Controllers.js');
const restrictToInstitute = require("../Middlewares/onlyInstitute.Middlewares.js");

const router = express.Router();

router.post('/institute/signup',signUpInstitute)
router.post('/institute/signin',loginInstitute)
router.post('/institute/createAdmin',restrictToInstitute,createAdmin)
router.post('/institute/admin/signin',loginAdmin)

router.post('/user/alumni/signup',alumniSignup)
router.post('/user/alumni/signin',signinAlumni)



module.exports = router;