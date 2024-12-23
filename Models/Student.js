const mongoose = require('mongoose');
const StudentSchema=mongoose.Schema({
    name:{type:String , required:true},
    age:{type:Number , required:true},
    strengths: {type:[String]},
    weaknesses: {type:[String]},
    interests:{type:[String]},
    preferences : {type:[String]}
});

module.exports= mongoose.model("Student",StudentSchema);