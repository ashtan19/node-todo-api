const {ObjectID} = require("mongodb");

const {mongoose} = require("./../server/db/mongoose");
const {Todo} = require("./../server/models/todo");
const {User} = require("./../server/models/user");

var id = "5b37bdb18fe319829bfa9ca011";

var userid = "5b36cfe36689f97a7ba86317";



if (ObjectID.isValid(userid)) {
    User.findById(userid).then((user) => {
        if(!user) {
            return console.log("User not found");
        }
        console.log("User found:");
        console.log(JSON.stringify(user, undefined, 2));
    }).catch((e) => {
        console.log(e);
    });
} else {
    console.log("User ID is not valid");
}


// if (!ObjectID.isValid(id)) {
//     console.log("ID is not valid");
// }

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log("Todos:", todos);
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     if (!todo) {
//         return console.log("ID not found.");
//     }
//     console.log("Todo:", todo);
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log("ID not found.");
//     }
//     console.log("Todo by ID:", todo);
// }).catch((e) => {
//     console.log(e);
// })

