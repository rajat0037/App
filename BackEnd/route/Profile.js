const express = require("express")
const router = express.Router()

const {auth} = require("../middleware/auth");
const {
    updateProfile,
    getAllUserDetails,
} = require("../controller/Profile");

router.put("/updateProfile", auth, updateProfile);
router.get("/getAllUserDetails", auth, getAllUserDetails);

module.exports = router