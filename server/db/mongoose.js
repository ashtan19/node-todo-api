var mongoose = require("mongoose");

mongoose.Promise = global.Promise; //set the mongoose promises to nodes promises

// This either connect to the heroku mongolab db or the local host
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/TodoApp");


module.exports = {
    mongoose
}