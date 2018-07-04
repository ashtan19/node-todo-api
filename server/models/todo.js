var mongoose = require("mongoose");

// This is a model for a Todo object that will be stored in mongoDB. Kinda like a struct
var Todo = mongoose.model("Todo", {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    _creator: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    }
});

module.exports = {Todo};


// var newTodo = new Todo({
//     text: "    Edit this app!      "
// })

// newTodo.save().then((doc) => {
//     console.log("Saved doc", doc);
// }, (e) => {
//     console.log("Unable to save new Todo", JSON.stringify(e, undefined, 2));
// });
