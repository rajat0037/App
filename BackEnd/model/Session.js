const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    Admin:{
        type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
    },
    field: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Field',  // Reference to the Field model (e.g., Stress Management, Creativity)
            required: true,
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',  // Reference to the Category model (e.g., Physical, Mental, Emotional)
        required: true,
    },
    tag : {
        type : [String]
    },
    duration: {
        type: Number,  // Duration of the session in minutes
        required: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,  // Track if the session is completed or not
    },
    sessionType: {
        type: String,  // Track the type of session (e.g., "guided", "self-paced", "group", etc.)
        required: true,
        enum: ['guided', 'self-paced', 'group', 'one-on-one'],  // Optional: Predefined list of types
    },
    thumbnail: {
		type: String,
	},
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Reference to the User model for participants
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,  // When the session was created
    },
    updatedAt: {
        type: Date,
        default: Date.now,  // When the session was last updated
    },
});

module.exports = mongoose.model("Session", sessionSchema);
