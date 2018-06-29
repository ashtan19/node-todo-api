//const MongoClient = require("mongodb").MongoClient;
const {MongoClient, ObjectID} = require("mongodb"); //Destructuring an object

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
    if (err) {
        return console.log("Unable to connect to MongoDB server");
    }
    console.log("Connected to MongoDB server");
    const db = client.db("TodoApp");    //This is for MongoDB 3.1

    // db.collection("Todos").find({
    //     _id: new ObjectID("5b356a40be017f08690a80a9")
    // }).toArray().then((docs) => {
    //     console.log(`Todos`);
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log("Unable to fetch todos", err);
    // });

    db.collection("Todos").find().count().then((count) => {
        console.log(`Todos count: ${count}`);
    }, (err) => {
        console.log("Unable to fetch todos", err);
    });

    db.collection("Users").find({
        name: "Maple"
    }).toArray().then((docs) => {
        console.log("Users:");
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log("Unable to get Users with the name of Maple", err);
    });

    // client.close();
})
