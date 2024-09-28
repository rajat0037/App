const Activities = require("../model/Activities");
const Field = require("../model/Field");


// create Activities
exports.createActivities = async (req,res) => {
    try{
        const {
            fieldId,
            title,
            description,
            userId,
            status,
         } = req.body;

        //  validation
        if(!fieldId || !title || !description || !userId || !status){
            return res.status(404).json({
                success : false,
                message : "All fields are required",
            });
        }

        // create 
        const ActivitiesDetails = await Activities.create({
            title : title,
            description : description,
            status : status,
        })

        // update field schema with newly created Activities
        const updatedActivities = await Field.findByIdAndUpdate(
            {_id : fieldId},
            {$push : {activities : ActivitiesDetails._id}},
            {new : true}
        ).populate("activities")

        // return response
        return res.status(200).json({
            success : true,
            message : "Created Activity SUccessfully",
            data : updatedActivities,
        });
    } catch(error){
        console.log("Error while creating new Activity")
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
          })
    }
}

// update activity
exports.updateActivities = async(req,res) => {
    try{
        const {
            fieldId,
            activitiesId,
            title,
            description,
        } = req.body

        const Activity = await Activities.findById(fieldId);

        // validation
        if(!fieldId || !activitiesId || !title || !description){
            return res.status(404).json({
                success : false,
                message : "All fields are required",
            })
        }
        if(title !== undefined){
            Activity.title = title
        }

        if(description !== undefined){
            Activity.description = description
        }

        await Activity.save()

        // find updated field and return it
        const updatedField = await Field.findById(fieldId).populate("activities")
        console.log("updated field", updatedField)

        return res.status(200).json({
            success : true,
            message : "Activity updated Successfully",
            data : updatedField,
        })

    } catch(error){
        console.log(error)
        return res.status(500).json({
            success : false,
            message : "An error occured while updating the section",
        })
    }
}

// delete the Activity
exports.deleteActivity = async(req,res) => {
    try{
        const {fieldId,activitiesId} = req.body;
        await Field.findByIdAndUpdate(
            {_id : fieldId},
            {
                $pull:{
                    activities : activitiesId,
                },
            }
        )

        const activities = await Activities.findByIdAndDelete({_id : activitiesId})

        if(!activities){
            return res.status(404).json({
                success : false,
                message : "Activity not found"
            });
        }

        // find updated field and return it
        const updatedField = await Field.findById(fieldId).populate("activities")

        return res.status(200).json({
            success : true,
            message : "Activity deleted Successfully",
            data : updatedField,
        })
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success : true,
            message : "Cannot delete Activity",
        })
    }
}