const mongoose = require("mongoose");

const activitiesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,  // Title of the activity
    },
    description: {
        type: String,
        required: true,  // A brief description of the activity
    },
    field: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',  // Reference to the related field (e.g., "Stress Management")
        required: true,
    },
    // do i need to have activities schema in session also ?
    // session: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Session',  // Reference to the session that this activity is part of
    //     required: true,
    // },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Users who are participating in this activity
        }
    ],
    // tags: [
    //     {
    //         type: String,  // Array of tags related to the activity (e.g., "meditation", "mindfulness", etc.)
    //     }
    // ],
    duration: {
        type: Number,  // Optional: Duration of the activity in minutes
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],  // Track the status of the activity
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,  // Timestamp for when the activity was created
    },
    updatedAt: {
        type: Date,
        default: Date.now,  // Timestamp for when the activity was last updated
    }
});

module.exports = mongoose.model("Activities", activitiesSchema);
