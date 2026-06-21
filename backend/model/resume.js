const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

prompt:{
type:String,
required:true
},

fileUrl:{
type:String,
default:""
},

analysis:{
type:Object,
required:true
}

},{timestamps:true})

module.exports = mongoose.model("Resume",resumeSchema);