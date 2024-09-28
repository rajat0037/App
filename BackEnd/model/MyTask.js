const mongoose = require("mongoose");

const myTaskSchema = new mongoose.Schema({
   sessionName : {
    type : String,
    required : true,
   },
   description : {
    type : String,
    required : true,
   },
   session : [
     {
        type: mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Session',
     }
   ],
});
module.exports = mongoose.model("MyTask", myTaskSchema);