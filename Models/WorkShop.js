const mongoose = require('mongoose');
const WorkShopSchema = mongoose.Schema({
    name: {type:String , required:true},
    desc:{type:String , required:true},
    preferences : {type:[String] , required:true},
    image : {type:String},
    students : {type:[String]} ,
    price: {type:String , default:'free' },
    positive:{type:Number , default:0} , //positve responses 
    negative:{type:Number , default:0}
});

module.exports = mongoose.model('WorkShop', WorkShopSchema);