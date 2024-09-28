const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,  // Name of the field (e.g., "Stress Management", "Creativity")
    },
    description: {
        type: String,
        required: true,  // A brief description of the field
    },
    sessions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',  // List of sessions related to this field
    },
    activities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Activities',  // List of activities related to this field
        }
    ],
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Users who have joined this field
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,  // Field creation date
    },
    updatedAt: {
        type: Date,
        default: Date.now,  // Last update date
    },
});

module.exports = mongoose.model("Field", fieldSchema);
