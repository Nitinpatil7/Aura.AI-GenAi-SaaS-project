const mongodb = require('mongoose');

const connectdb = async ()=>{
    try {
        const conn = await mongodb.connect(process.env.MONGO_URL);
        console.log("Database Connected");
        return conn;
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}
module.exports = connectdb;