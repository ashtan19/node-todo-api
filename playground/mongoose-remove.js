const {ObjectID} = require("mongodb");

const {mongoose} = require("./../server/db/mongoose");
const {Todo} = require("./../server/models/todo");
const {User} = require("./../server/models/user");

// Todo.remove({}).then((result) => {
//     console.log(result);
// });

Todo.findOneAndRemove({_id: "5b37f23dbe017f08690aba04"}).then((todo) => {
    console.log(todo);
});

// Todo.findByIdAndRemove("5b37f23dbe017f08690aba04").then((todo) => {
//     console.log(todo);
// });