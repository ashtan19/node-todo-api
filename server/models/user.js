const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

//
var UserSchema= new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        } 
    }]
})

//Override
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ["_id", "email"]);
};

// Use this method to create a token for a new user
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = "auth";
    var token = jwt.sign({_id: user._id.toHexString(), access}, "abc123").toString();

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => {
        return token;
    });
}

// This is a model method instead of an instance method
UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;                //Decoded jwt token 

    try {
        decoded = jwt.verify(token, "abc123");
    } catch (e) {
        return Promise.reject();            //Reject to stop the program from continuing
    };

    //Return because it will allow you to add chaining afterwards 
    return User.findOne({
        "_id": decoded._id,
        "tokens.token": token,                 //Wrap in quotes to query nested doc
        "tokens.access": "auth"
    })

}


//Cannot have methods on models
var User = mongoose.model("User", UserSchema);

module.exports = {User};



// var newUser = new User({
//     email: "     maple604@gmail.com     "
// });

// newUser.save().then((doc) => {
//     console.log("Saved new user:", doc);
// }, (e) => {
//     console.log("Unable to save the new user", JSON.stringify(e, undefined, 2));
// });