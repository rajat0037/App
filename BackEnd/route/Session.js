const express = require("express")
const router = express.Router()

// session
const{
    createSession,
    showAllSession,
    deleteSession,
    getSessionAllDetails,

} = require("../controller/Session");

// category
const {
    createCategory,
    showAllCategories,
    categoryPageDetails
} = require("../controller/category");


// field
const {
    createField,
    updateField,
    deleteField,
} = require("../controller/Field");

// activity
const {
    createActivities,
    updateActivities,
    deleteActivity
} = require("../controller/Activities");

// middleware
const{
    auth, 
    isUser,
    isAdmin
} = require("../middleware/auth");


router.post("/createSession", auth, isAdmin, createSession)
router.post("/createField", auth, isAdmin, createField)
router.post("/updateField", auth, isAdmin, updateField)
router.post("/deleteField", auth, isAdmin, deleteField)
router.post("/createActivities", auth, isAdmin, createActivities)
router.post("/updateActivities", auth, isAdmin, updateActivities)
router.post("/deleteActivity", auth, isAdmin, deleteActivity)
router.post("/showAllSession", showAllSession)
router.post("/getSessionAllDetails", auth, getSessionAllDetails)
router.delete("/deleteSession", deleteSession)

router.post("/createCategory", auth, isAdmin, createCategory)
router.post("/showAllCategories", showAllCategories)
router.post("/categoryPageDetails", categoryPageDetails)

module.exports = router