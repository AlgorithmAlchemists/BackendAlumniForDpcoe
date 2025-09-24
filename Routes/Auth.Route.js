const express = require("express");
const signUpInstitute = require('../Controllers/Auth.Controllers.js')

const router = express.Router();
console.log('in')

router.post('/institute/signup',signUpInstitute)

module.exports = router;