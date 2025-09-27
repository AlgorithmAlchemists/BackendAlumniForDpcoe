const express = require("express");
const {signUpInstitute, loginInstitute, createAdmin, loginAdmin} = require('../Controllers/Auth.Controllers.js');
const restrictToInstitute = require("../Middlewares/onlyInstitute.Middlewares.js");

const router = express.Router();
console.log('in')

router.post('/institute/signup',signUpInstitute)
router.post('/institute/signin',loginInstitute)
router.post('/institute/createAdmin',restrictToInstitute,createAdmin)
router.post('/institute/admin/signin',createAdmin)

module.exports = router;