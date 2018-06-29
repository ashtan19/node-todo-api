//const MongoClient = require("mongodb").MongoClient;
const {MongoClient, ObjectID} = require("mongodb"); //Destructuring an object

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
    if (err) {
        return console.log("Unable to connect to MongoDB server");
    }
    console.log("Connected to MongoDB server");
    const db = client.db("TodoApp");    //This is for MongoDB 3.1

    // db.collection('Todos').insertOne({
    //     text: "Maple is here",
    //     completed: false

    // }, (err, result) => {
    //     if (err) {
    //         return console.log("Unable to insert Todo", err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // })

    db.collection("Users").insertOne({
        name: "Maple",
        age: "21",
        location: "Vancouver"
    }, (err, result) => {
        if (err) {
            return console.log("Unable to add a new user", err);
        }
        console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
    });

    client.close();
})
