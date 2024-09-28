
const User = require("../model/User");
const Otp = require("../model/Otp");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/MailSender");
const Profile = require("../model/Profile");
const { passwordUpdated } = require("../mail/passwordUpdate");

require("dotenv").config();

// signup
exports.signup = async (req,res) => {
    try{
        // req.body matlab data frontend mei dala hoga user ne
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,  // user admin
            contactNumber,
            otp,
        } = req.body

        if(
            !firstName ||
            !lastName || 
            !email ||
            !password || 
            !confirmPassword ||
            !otp
        ) {
            return res.status(403).json({
                success : false,
                message : "All feilds are required",
            })
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : "Password and Confirm Password must be same",
            })
        }

        const existingUser = await User.findOne({email})
        if(existingUser) {
            return res.status(400).json({
                success : false,
                message : "User already exits, please login to continue",
            })
        }

        // find the most recent otp

        // sort -1 means sort in desending order, limit 1 means returns the single most recent document from the collection.
        const response = await Otp.find({email}).sort({createdAt : -1}).limit(1)
        console.log(response)

        if(response.length === 0){
            return res.status(400).json({
                success : false,
                message : "Otp is not valid",
            })
        } else if(otp !== response[0].otp){
            return res.status(400).json({
                success : false,
                message : "Otp is not valid",
            })
        }

        // 10 is number of roundes
        const hashedPassword = await bcrypt.hash(password, 10)

        // create additional profile for user
        const profileDetails = await Profile.create({
            gender : null,
            dateOfBirth : null,
            about : null,
            contactNumber : null,
        })

        // created entry in db
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password : hashedPassword,
            accountType : accountType,

            // profile bana pardege, to upr bane hai jaha mene sub kuch null kar deya
            // profile ka data db mei save karna padega tabhi create function use keya hai taki additional details mei ke 'profileDetails._id' daal saku 
            // 
            additionalDetails : profileDetails._id,
            image : `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success : true,
            user,
            message : "User registered successfully",
        })
    } catch (error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "User cannot be registered, please try again",
        })
    }
}

// login
exports.login = async (req, res) => {
    try{
        const {email, password} = req.body

        if(!email || !password) {
            return res.status(400).json({
                success : false,
                message : "Email and password are required",
            })
        }
        

        const user = await User.findOne({email}).populate("additionalDetails")

        if(!user){
            return res.status(401).json({
                success : false,
                message : "User is not register sign up first",
            })
        }

        // generate jwt, first match the password through compare function of bcrypt
        if(await bcrypt.compare(password, user.password)){

            // token is created from sign method
            const token = jwt.sign(

                // email, id, additionalDetails is payLoad
                {email : user.email, id : user._id, additionalDetails : user.additionalDetails},
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h",
                }
            )

            // save token to user document in db
            user.token = token
            console.log("token", token);
            user.password = undefined

            // set cookies for token and return sucess response
            const options = {

                // 3 din
                expires : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),

                // cookie is not accessible via JavaScript (e.g., through document.cookie), which improves security
                httpOnly : true,
            }

            // cookie ke ander 3 chije pass karne hote hai i.e name, value, options
            res.cookie("token", token, options).status(200).json({
                success : true,
                token,
                user,
                message : "user loggedin successfully",
            })
        } else{
            return res.status(401).json({
                success : false,
                message : "Password is incorrect",
            })
        }
    } catch(error){
        console.log(error)
        return res.status(500).json({
            success : false,
            message : "fail to login",
        })
    }
}

// send otp for email Verification
exports.sendOtp = async (req,res) => {
    try{
        const {email} = req.body

        // check if user is already present
        const checkUserPresent = await User.findOne( {email })

        if(checkUserPresent){
            return res.status(401).json({
                success : false,
                message : "User already registered",
            })
        }

        // generate function is used to generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false,
        })
        // make sure otp is uniqueee
        const result = await Otp.findOne({otp : otp})
        console.log("OTP", otp)
        console.log("Result", result)

        // agr unique nahi hai to new otp genrate kar rahe hai
        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false,
            });
            result = await Otp.findOne({otp : otp})
        }

        // otpPayLoad bane according to otpSchema
        const otpPayLoad = {email, otp}

        // create an entry in db 
        const otpBody = await Otp.create(otpPayLoad)
        console.log("OTP Body", otpBody)
        res.status(200).json({
            success : true,
            message : "otp send successfully",
            otp,
        })
    } catch(error){
        console.log(error.message)
        return res.status(500).json({
            success : false,
            message : "fail to send otp",
        })
    }
}

// change password
exports.changePassword = async(req,res) => {
    try{
        // get userdata
        const userDetails = await User.findById(req.user.id);
        console.log(userDetails);

        // validation
        if (!req.user || !req.user.id) {
            return res.status(400).json({
                success: false,
                message: "User not authenticated."
            });
        }

        // get old password, new Password and confirm password 
        const {oldPassword, newPassword} = req.body;

        // validate old and new password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        )

        if(!isPasswordMatch){
            return res.status(401).json({
                success : false,
                message : "password is incorrect",
            })
        }

        // update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password : encryptedPassword},
            {new:true}
        )

        // send notification email
        try{
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.name,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            )
            console.log("Email sent successfully : ", emailResponse.response)
        } catch(error){
            console.error("Error occurred while sending Email:", error);
            return res.status(500).json({
                success : false,
                message : "Error occured while sending email",
                error : "Error occurred while sending email",
                error : error.message,
            })
        }
        // return success 
        return res.status(200).json({
            success : true,
            message : "Password updated successfully",
        })
    } catch(error){
        console.log("Error occurred while updating password : ", error)
        return res.status(500).json({
            success : false,
            message : "Error occurres while updating password",
            error : error.message,
        })
    }
}
