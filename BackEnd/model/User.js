const mongoose = require("mongoose");
const { resetPassword } = require("../controller/ResetPassword");

const userSchema = new mongoose.Schema(
    {
        firstName : {
            type : String,
            required : true,
            trim : true,
        },
        lastName : {
            type: String,
            trim : true,
        },
        email : {
            type: String,
            required : true,
            trim : true,
        },
        password: {
            type: String,
            require : true,
            trim : true,
        },
        accountType : {
            type : String,
            enum : ["Admin", "User"],
            required : true,
        },
        additionalDetails: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Profile",
		},
        session:{
            type : mongoose.Schema.Types.ObjectId,
            ref : "Session",
        },
        // token is added in user for resetPassword
        // har ke user ka ek token hoga or expiration time hoga
        token : {
            type : String,
        },
        resetPasswordExpires:{
            type : Date,
        },
        myTask : [
            {
                type: mongoose.Schema.Types.ObjectId,
                
                ref : "Session"
            }
        ],
        taskProgress : [
            {
                type: mongoose.Schema.Types.ObjectId,
                
                ref : "TaskProgress"
            }
        ],
        image:{
            // url aaega
            type:String,
        }

    },
);

module.exports = mongoose.model("User", userSchema);