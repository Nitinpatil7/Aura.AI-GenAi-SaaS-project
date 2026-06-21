// models/websiteHistory.js

const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema({

 user:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true
 },

 type:String,
 theme:String,
 font:String,

 prompt:String,

 code:String

},{timestamps:true});

module.exports = mongoose.model("Website",websiteSchema);