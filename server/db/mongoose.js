var mongoose = require("mongoose");

mongoose.Promise = global.Promise; //set the mongoose promises to nodes promises
mongoose.connect("mongodb://localhost:27017/TodoApp");


module.exports = {
    mongoose
}