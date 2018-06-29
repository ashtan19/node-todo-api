//const MongoClient = require("mongodb").MongoClient;
const {MongoClient, ObjectID} = require("mongodb"); //Destructuring an object

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
    if (err) {
        return console.log("Unable to connect to MongoDB server");
    }
    console.log("Connected to MongoDB server");
    const db = client.db("TodoApp");    //This is for MongoDB 3.1

    // db.collection("Todos").findOneAndUpdate({
    //     _id: new ObjectID("5b358067be017f08690a8aee")
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // }, {
    //     returnOriginal: false
    // }).then((result) => {
    //     console.log(result);
    // })

    db.collection("Users").findOneAndUpdate({
        _id: new ObjectID("5b3563082794454b3f1e6766")
    }, {
        $set: {
            name: "Maple"
        }, $inc: { age: -1}
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log(result);
    })

    // client.close();
})