var mongoose = require("mongoose");

var User = mongoose.model("User", {
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
});

module.exports = {User};



// var newUser = new User({
//     email: "     maple604@gmail.com     "
// });

// newUser.save().then((doc) => {
//     console.log("Saved new user:", doc);
// }, (e) => {
//     console.log("Unable to save the new user", JSON.stringify(e, undefined, 2));
// });