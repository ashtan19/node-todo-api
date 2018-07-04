const {ObjectID} = require('mongodb');
const jwt = require("jsonwebtoken");

const {Todo} = require('./../../models/todo');
const {User} = require("./../../models/user");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: "maple123@gmail.com",
    password: "userOnePass",
    tokens: [{
        access: "auth",
        token: jwt.sign({_id: userOneId, access: "auth"}, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: userTwoId,
    email: "kathy321@hotmail.com",
    password: "userTwoPass",
    tokens: [{
        access: "auth",
        token: jwt.sign({_id: userTwoId, access: "auth"}, process.env.JWT_SECRET).toString()
    }]
}]

// Different from populating todos because we need the hashing middleware to run
const populateUsers = (done) => {
    User.remove({}).then(() => {
        var user1 = new User(users[0]).save();
        var user2 = new User(users[1]).save();

        return Promise.all([user1, user2]).then(() => done());
    });
};

const todos = [{                        //Prepopulate the db
    text: "First Test Todo",
    _id: new ObjectID (),
    _creator: userOneId    
}, {
    text: "Second Test Todo",
    _id: new ObjectID (),
    completed: true,
    completedAt: 1234,
    _creator: userTwoId
    
}]

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);              //Insert the seed data
    }).then(() => done());
};

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
}