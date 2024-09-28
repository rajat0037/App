const mongoose = require("mongoose");

const taskProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',  // Reference to the Session model
        required: true
    },
    completedSession: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Session',  // Reference to the Session model when completed
            required: true
        }
    ],
    completedAt: {
        type: Date,  // Track the date when the session was completed
        default: Date.now
    }
});

module.exports = mongoose.model("TaskProgress", taskProgressSchema);
