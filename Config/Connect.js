require('dotenv').config();
const mongoose = require('mongoose');
const MongoURI = process.env.URI;

const connect = async()=>{
    try {
        if(!MongoURI){
            throw new Error("URI is faulty ");
        }
        await mongoose.connect(MongoURI);
        console.log("MONGODB CONNECTED");
        
    } catch (error) {
        console.error("Something went wrong \n", error.message);
        process.exit(1);
        
    }

}
module.exports = connect;