const express = require("express")
const router = express.Router()

const {
    signup,
    login,
    sendOtp,
    changePassword
} = require("../controller/Auth");
const{
    resetPasswordToken,
    resetPassword
} = require("../controller/ResetPassword");

const {auth} = require("../middleware/auth")

router.post("/login",login)
router.post("/signup",signup)
router.post("/sendOtp",sendOtp)
router.post("/changePassword", auth,changePassword)

router.post("/resetPasswordToken",resetPasswordToken)
router.post("/resetPassword", resetPassword);

module.exports = router;