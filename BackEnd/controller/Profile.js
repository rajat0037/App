const User = require("../model/User");
const Profile = require("../model/Profile");

// profile null set ke hai mene signup banate time ab mujhe bas update karna hai create karne ke jarurat nahi hai
exports.updateProfile = async(req,res) => {
    try{

        // get data
        const {
            gender = "",
            dateOfBirth = "",
            contactNumber = "",
            about = ""
        } = req.body;

        // get userId
        // req.user mei decode dala hai auth mei or mene yeh payLoad generate keya tha login ke time par
        const id = req.user.id;

        // validation
        if(!gender || !dateOfBirth || !contactNumber || !about){
            return res.status(400).json({
                success : false,
                message : "All Fields are required",
            })
        }

        // find profile
        // to find profileId userDetails nikal lo or User model mei AdditionDetails mei profileId hai
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        // db mei entry create karne ke 2 ways hai
        // 1 object nahi banaya hai to create function use kar lo
        // 2 object bana parda hai save function use kar lo

        await profileDetails.save();

        // return response
        return res.status(200).json({
            success : true,
            message : "Profile updated Successfully",
            // while sending in response i have send a contact number also
            // which is not a good practice
            profileDetails,
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            error : error.message,
        });
    }
};


// let say i want to delete the account of user after 5 days the i have to use 'node-cron'
// delete Account
exports.deleteAccount = async(req,res) => {
    try{
        // get id so i can delete account
        const id = req.user.id;

        // check if id is valid
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success : false,
                message : "user not found",
            });
        }

        // delete profile 
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        // aisa to nahi ho sakta na ki user hai hi nahi or uski additional Details hai to phele additionDetails delete kar do
        // delete user
        // agr user login hoga tabhi bol raha hai account delete karne ko to mei userId nikal sakta hu
        await User.findByIdAndDelete({_id : id});

        // return response
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
          });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            error : error.message,
        });
    }
}

// get all details of user
exports.getAllUserDetails = async(req,res) => {
    try{
        const id = req.user.id;
        const userDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec();
        console.log(userDetails);

        if(!userDetails){
            return res.status(404).json({
                success : false,
                message : error.message,
            });
        }

        return res.status(200).json({
            success : false,
            message : "User Data fetched successfully",
            data : userDetails,
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}

// // get all user details
// exports.getAllUserDetails = async(req,res) => {
//     try{
//         const id = req.user.id;
//         const userDetails = await User.findById(id)
//         .populate("additionalDetails")
//         .exec();

//         console.log("User Details", userDetails);

//         if(!userDetails){
//             return res.status(404).json({
//                 success : false,
//                 message : "User not found",
//             })
//         }

//         return res.status(200).json({
//             success : true,
//             message : "User Data Fetched Successfully",
//             data : userDetails,
//         })
//     } catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success : false,
//             message : "Cannot fetch data of user",
//             error : error.message,
//         })
//     }
// }