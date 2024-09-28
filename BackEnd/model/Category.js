const mongoose = require("mongoose");
const Session = require("./Session");

const categorySchema = new mongoose.Schema({
    name:{
        type : String,
    },
    description : {
        type : String,
    },
    // ek tag multiple session mei bhi ho sakta hai
    session:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Session',
        }
    ],
    
});
module.exports = mongoose.model("Category", categorySchema);