//const MongoClient = require("mongodb").MongoClient;
const {MongoClient, ObjectID} = require("mongodb"); //Destructuring an object

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
    if (err) {
        return console.log("Unable to connect to MongoDB server");
    }
    console.log("Connected to MongoDB server");
    const db = client.db("TodoApp");    //This is for MongoDB 3.1

    //deleteMany
    // db.collection("Todos").deleteMany({text: "Write all the thank you cards"}).then((result) => {
    //     console.log(result);
    // })

    //deleteOne
    // db.collection("Todos").deleteOne({text: "Eat lunch"}).then((result) => {
    //     console.log(result);
    // })

    //findOneAndDelete
    // db.collection("Todos").findOneAndDelete({completed: false}).then((result) => {
    //     console.log(result);
    // })

    //Delete users with name of Maple
    db.collection("Users").deleteMany({name: "Maple"}).then((result) => {
        console.log(result);
    });

    //Delete user by ID
    db.collection("Users").findOneAndDelete({
        _id: new ObjectID("5b3565fde66f4c4bef93bbb3")
    }).then((result) => {
        console.log(result);
    });

    // client.close();
})
