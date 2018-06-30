/**
 * Should only have express.js configs in here
 * Responsible for the routes
 */

var express = require("express");
var bodyParser = require("body-parser");

var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");

var app = express();

// Express Middleware
// Can send JSON to our app
app.use(bodyParser.json());

//Structure for resource creation - creating something new resource that would be stored
app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
        console.log("Todo has been saved");
    }, (e) => {
        res.status(400).send(e);
        console.log("Unable to save this new Todo", e);
    })
});

app.listen(3000, () => {
    console.log("Started on port 3000");
});


module.exports = {
    app
}

