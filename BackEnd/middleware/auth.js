const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../model/User");

dotenv.config();

// this function is used as middlerware to authenticaticate user request
exports.auth = async (req,res,next) => {
    try{
        // token can be extract from cookies,body,bearer
        const token = 
        req.cookies.token ||
        req.body.token || 

        // token milega header mei authorization mei 
        // it look like Authorization: Bearer <your-token>
        // so i will replace the Bearer with empty string
        req.header("Authorization").replace("Bearer", "");
        
        
        // if jwt is missing, return 401 unauthorized response
        if(!token){
            return res.status(401).json({
                success : false,
                message : 'token missing'
            })
        }

        try{

            // verifying the jwt using the secret key stored in enviroment variable

            // verify method of jwt is used to verify the token
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);

            // storing the decode jwt payload in the request object for future use
            // token mene login karte time banaya hai or usko ab verify kar ke decode variable mei daal deya or decode variable mei jo bhi hai usko ko req.user mei daal deya
            // decode ke ander hai email, id or additional details
            // so if i want i can access the email from req.user.email from isUser contoller, niche likha hai dekh
            req.user = decode;

        } catch (error){
            return res.status(401).json({
                success : false,
                message : "token is invalid",
            });
        }
        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success : false,
            message : "something went wrong while verifing the token",
        });
    }
};

// isUser
exports.isUser = async (req,res,next) => {
    try{
        // as i have store the decode in req.user
        const userDetails = await User.findOne({email : req.user.email});

        // or i can write like if(req.user.accountType !== "User")
        if(userDetails.accountType !== "User"){
            return res.status(401).json({
                success : false,
                message : "This is a protected Routes for User",
            });
        }
        next();
    } catch (error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "User role can't be verified",
        });
    }
};

// isAdmin
exports.isAdmin = async (req,res,next) => {
    try{
        const userDetails = await User.findOne({email : req.user.email});

        if(userDetails.accountType !== "Admin"){
            return res.status(401).json({
                success : false,
                message : "This is a protected Routes for Admin",
            });
        }
        next();
    } catch (error){
        return res.status(500).json({
            success : false,
            message : "user role can't be verified",
        });
    }
};