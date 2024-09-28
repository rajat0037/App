const Activities = require("../model/Activities");
const Category = require("../model/Category");
const Field = require("../model/Field");
const Session = require("../model/Session");
const User = require("../model/User");
const {uploadImageToCloudinary} = require("../utils/ImageUploader");

// create session
exports.createSession = async(req,res) => {
    try{

        // only admin can create a session
        const {
            title,
            description,
            category,
            duration,
            isCompleted,
            sessionType,
            participants,
            createdAt,
            updatedAt
        } = req.body;

        // get thumbnail image
        const thumbnail = req.files.thumbnailImage;

        // validation
        if(!thumbnail || !title || !description || !category || !duration || !isCompleted || !participants || !sessionType || !createdAt ){
            return res.status(400).json({
                success : false,
                message : "All fields are required",
            });
        }

        // check if it is a Admin 
        // jab session create kar rahe hai to admin ki id store karne pardte hai
        // decode dala tha req.user mei, auth middleware bante time 
        // capital U hai UserId mei or req.body se small u hai userId
        const UserId = req.user.id;

        // mere pass Admin ki userId to hai but objectId nahi hai to mene AdminDetails bana kar objectId nikal le
        const AdminDetails = await User.findById(UserId);
        console.log("AdminDetails", AdminDetails);

        if(!AdminDetails){
            return res.status(404).json({
                success : false,
                message : "Admin not found",
            });
        }

        // check given category is valid or not
        // session schema mei category as a ref store hai to yaha category ek id hai thats why i have used findById
        const CategoryDetails = await Category.findById(category);

        if(!CategoryDetails){
            return res.status(404).json({
                success : false,
                message : "Not a Valid Category",
            });
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create a new  entry for new session
        const newSession = await Session.create({
            title,
            description,
            // mene session schema mei participants as a ref store keya hua hai to mujhe id dene pardege 
            Admin : AdminDetails._id,
            category : CategoryDetails._id,
            thumbnail : thumbnailImage.secure_url,
            sessionType,
            createdAt,
            duration,
            isCompleted,
        })

        // add new session to the user schema of Admin
        await User.findByIdAndUpdate(
            {_id:AdminDetails._id},
            {
                // session name same hoga jo mene user schema mei banaya hai
                $push:{session:newSession._id}
            },
            {new : true},
        );

        // update the catergory schema
        await Category.findByIdAndUpdate(
            { _id: CategoryDetails._id },
            {
              $push: {
                session:newSession._id,
              },
            },
            { new: true }
          );

          return res.status(200).json({
            success : true,
            message : "Session created successfully",
            data : newSession,
          });

    } catch (error){
        console.error(error);
        return res.status(500).json({
            success : false,
            message : "Failed to create session",
            error : error.message,
        })
    }
}

// get all session
exports.showAllSession = async(req,res) =>{
    try{
        const allSession = await Session.find({},{title : true,
                                                  description : true,
                                                  category : true,
                                                  duration : true,
                                                  isCompleted : true,
                                                  sessionType : true,
                                                  participants : true,
                                                  createdAt : true})
                                                  .populate("participants")
                                                  .exec();
    return res.status(200).json({
        success : false,
        message : "Data for all session fetched successfully ",
        data : allSession,
    })                                       
        
    } catch(error){
        console.error(error);
        return res.status(500).json({
            success : false,
            message : "cannot fetch session data",
            error : error.message,
        })
    }
}

// delete Session

// The participantId and fieldId are being retrieved from the session object (session.participants and session.field)
exports.deleteSession = async(req,res) => {
    try{
        const {sessionId} = req.body;

        // find session
        const session = await Session.findById(sessionId);
        if(!session){
            return res.status(404).json({
                success : false,
                message : error.message,
            });
        }
        // unerolled participants for session
        const participants = session.participants
        for(const participantsId of participants){
            await User.findByIdAndUpdate(participantsId,{
                $pull : {
                    session : sessionId
                },
            })
        }

        // delete fields and activities
        const fieldSection = session.field
        for(const fieldId of fieldSection){
            // delete activities of the fields
            const field = await File.findById(fieldId)
            if(field){
                const activities = field.activities
                for(const activitiesId of activities){
                    await Activities.findByIdAndDelete(activitiesId)
                }
            }

            // delete the fields
            await Field.findByIdAndDelete(fieldId)
        }

        // delete session
        await Session.findByIdAndDelete(sessionId);

        return res.status(200).json({
            success : true,
            message : "Session deleted successfully",
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "cannot delete session",
            error : error.message,
        })
    }
}


// get session all details
exports.getSessionAllDetails = async(req,res) => {
    try{
        // get id
        const {sessionId} = req.body;

        // find session details
        const sessionDetails = await Session.find(
            {_id:sessionId})
            .populate(
                {
                    // i am populating in this way because participants i.e user ke ander additionalDetails bhi hai usko bhi populate karna hai
                    path:"participants",
                    populate:{
                        path : "additionalDetails",
                    },
                }
            )
            .populate("category")
            .populate({
                path : "field",
                populate:{
                    path:"activities"
                },
            })
            .exec();

    // validation
    if(!sessionDetails){
        return res.status(404).json({
            success : false,
            message : `could not find the session with ${sessionId}`,
            error : error.message
        })
    }

    return res.status(200).json({
        success : true,
        message : "session details fetched successfully",
        data : sessionDetails,
    })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "cannot fetched details for session",
            error: error.message,
        })
    }
}

