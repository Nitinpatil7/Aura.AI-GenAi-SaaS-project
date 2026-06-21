const express = require('express');
const {register , login , logout , me , changepassword , updateprofile} = require('../controller/authcontroller')
const authmiddlewere = require('../middlewere/authmiddlewere');
const validate = require('../middlewere/validate');
const schemas = require('../utils/schemas');

const router = express.Router();

router.post('/register', validate(schemas.auth.register), register);
router.post('/login', validate(schemas.auth.login), login);
router.post('/logout', logout);
router.get('/me', authmiddlewere, me);
router.put("/profile", authmiddlewere, validate(schemas.auth.updateProfile), updateprofile);
router.put("/password", authmiddlewere, validate(schemas.auth.changePassword), changepassword);

module.exports = router;