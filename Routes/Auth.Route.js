const express = require("express");
const {signUpInstitute, loginInstitute} = require('../Controllers/Auth.Controllers.js')

const router = express.Router();
console.log('in')

router.post('/institute/signup',signUpInstitute)
router.post('/institute/signin',loginInstitute)

module.exports = router;