const mongoose = require('mongoose'); 

const subscriptionschema = new mongoose.Schema({
    user:{type: mongoose.Schema.Types.ObjectId, ref: "User"},
    plan:{type:String, enum :["free","pro","premium"], default:"free"},
    startdate: {type: Date, default:Date.now},
    enddate:Date,
  status: { type: String, enum: ["active", "canceled"], default: "active" },
})

module.exports = mongoose.model("Subscription", subscriptionschema );