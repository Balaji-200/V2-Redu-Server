const mongoose = require('mongoose');

const connectDB = async () =>{
    try {
        const connect  = await mongoose.connect(process.env.MONGO_URI, {useUnifiedTopology: true, useNewUrlParser: true});
        console.log(`Connected to MongoDB ${connect.connection.host}`);
    }catch(err){
        console.error(err);
    }
}

module.exports = connectDB;