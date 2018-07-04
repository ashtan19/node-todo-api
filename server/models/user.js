const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

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

// INSTANCE METHODS 

// Use this method to create a token for a new user
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = "auth";
    var token = jwt.sign({_id: user._id.toHexString(), access}, "abc123").toString();

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({                   // $pull will pull out an object from an array and remove it
        $pull: {
            tokens: {token}
        }
    })
}


//MODEL METHODS

// This is a model method instead of an instance method
UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    // Returning a promise back to server.js
    return  User.findOne({email: email.trim()}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        // Need to return promise because bcrypt only supports callbacks
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    resolve(user);              // Pass the user back
                } else {
                    reject();                   // The rejection will get caught at the other end
                }
            });
        })
    });
}

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

// Before a save function is called on user schema, do this:
UserSchema.pre("save", function (next) {
    var user = this;

    //check if the password has been modified
    if (user.isModified("password")) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                //console.log("Password Encryption succeeded!");
                next();                
            });
        });
    } else {
        next();
    }
})

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