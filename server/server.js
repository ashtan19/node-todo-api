/**
 * Should only have express.js configs in here
 * Responsible for the routes
 */


/* Things for Heroku
heroku addons:create mongolab:sandbox
heroku config ~This will show the mongodb uri that your app can connect to
git push heroku master
*/

const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require("mongodb");
const _ = require("lodash");

var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");

var app = express();
var port = process.env.PORT || 3000;

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

app.get("/todos", (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});              //Send an object instead of arrays. More flexible(eg. can add status codes)
    }, (e) => {
        res.status(400).send(e);
    });
});


//GET /todos/123456
app.get("/todos/:id", (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log("ERROR: Todo ID not valid");
        return res.status(404).send();
    };
    Todo.findById(id).then((todo) => {
        if (!todo) {
            console.log("ERROR: Todo not found");
            return res.status(404).send();
        };
        res.status(200).send({todo});
    }).catch((e) => {
        res.status(400).send();
        console.log("Error getting ID");
    })
});

app.delete("/todos/:id", (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log("ERROR: Todo ID not valid");
        return res.status(404).send();
    };
    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            console.log("ERROR: Todo not found");
            return res.status(404).send();
        };
        console.log("Delete Successful");
        res.status(200).send({todo});
    }).catch((e) => {
        res.status(400).send();
        console.log("ERROR: Unable to get ID and delete todo");
    })
});

app.patch("/todos/:id", (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']); //Subset of the properties that the user passed to the program

    if (!ObjectID.isValid(id)) {
        console.log("ERROR: Todo ID not valid");
        return res.status(404).send();
    };

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            console.log("ERROR: No todo to find and update");
            return res.status(404).send();
        }
        res.status(200).send({todo});
    }).catch((e) => {
        console.log("ERROR");
        res.status(400).send();
    })
});




app.listen(port, () => {
    console.log(`Started on port: ${port}`);
});


module.exports = {
    app
}

