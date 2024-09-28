const Field = require("../model/Field");
const Session = require("../model/Session");
const Activities = require("../model/Activities");

exports.createField = async(req,res) =>{
    try{
        // data fetch
        const {
            name,
            description,
            participantsId,
            SessionId
        } = req.body;

        // data validation
        if(!name || !description || !participantsId || !SessionId){
            return res.status(400).json({
                success : false,
                message : "All fields are required",
            });
        }

        // create field
        const newField = await Field.create({name});

        // update session with field ObjectId
        const updatedFieldDetails = await Session.findByIdAndUpdate(
                                            SessionId,
                                            {
                                                $push:{
                                                    // session wale model mei field name ki entry hai usko update karna hai
                                                    field:newField._id,
                                                }
                                            },
                                            {new : true},
        )
        .populate({
            path : "field",
            populate:{
                path : "activities",
            },
        })
        .exec();

        // return response
        res.status(200).json({
			success: true,
			message: "Field created successfully",
			updatedFieldDetails,
		});
    } catch(error){
        res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
}

// update a field
exports.updateField = async(req,res) => {
    try{
        // fetch data
        const {
            name,
            description,
            SessionId,
            FieldId,
        } = req.body;

        // validation
        if(!name || !description || !SessionId || !FieldId){
            return res.status(400).json({
                success : false,
                message : "All Fields are required",
            });
        }

        // update data
        const updatedField = await Field.findByIdAndUpdate(
            FieldId,
            {
                name : name,
                description : description,
            },
            {new : true}
        );

        // agr mei field update karta hu to mujhe session mei ja kar update karne
        //  ke jarurat nahi hai kyuki session mei field ki id hai or id to same hi rahege
        const session =await Session.findById(SessionId)
        .populate({
            path : "field",
            populate:{
                path : "activities",
            },
        })
        .exec();

        // return response
        return res.status(200).json({
            success : true,
            message : updatedField,
            data : session,
        });

    } catch(error){
        res.status(500).json({
			success: false,
			message: "cannot delete Field",
			error: error.message,
		});
    }
}


// delete field
exports.deleteField = async(req,res) => {
    try{
        // get id
        const {SessionId, FieldId} = req.body;

        // field ki id session se bhi to delete karne pardege
        await Session.findByIdAndUpdate(SessionId,{
            $pull:{
                field : FieldId,
            }
        })

        const field = await Field.findById(FieldId);
        console.log(FieldId,SessionId);
        if(!field){
            return res.status(404).json({
                success : false,
                message : "Field not found",
            })
        }

        // delete activities
        // $in: This is a MongoDB operator that is used to check if a value is part of an array of values
        await Activities.deleteMany({_id: {$in: field.activities}});

        await Field.findByIdAndDelete(FieldId);

        // find the updated session and return
        const session = await Session.findById(SessionId).populate({
            path : "field",
            populate:{
                path : "activities",
            }
        })
        .exec();

        return res.status(200).json({
            success : true,
            message : "Field deleted successfully",
            data : session,
        });
    } catch(error){
        res.status(500).json({
			success: false,
			message: "cannot Deleted field",
			error: error.message,
		});
    }
}