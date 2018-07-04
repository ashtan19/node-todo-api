/**
 * Should only have express.js configs in here
 * Responsible for the routes
 */


/* Things for Heroku
heroku addons:create mongolab:sandbox
heroku config ~This will show the mongodb uri that your app can connect to
git push heroku master
*/

require("./config/config");

const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require("mongodb");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");
var {authenticate} = require("./middleware/authenticate");


var app = express();
var port = process.env.PORT;

// Express Middleware -> use app.use() to use a middleware
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


/**
 * User Routes
 */

app.post("/users", (req, res) => {
    var body = _.pick(req.body, ["email", "password"]);
    var user = new User(body);
    
    user.save().then(() => {
        return user.generateAuthToken();    
        //res.send(user);
        console.log("New user created and saved!");
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
        console.log("Unable to create and save new user", e);
    });

});


app.get("/users/me", authenticate, (req, res) => {
    res.send(req.user);
});

app.post("/users/login", (req, res) => {
    var body = _.pick(req.body, ["email", "password"]);

    User.findByCredentials(body.email, body.password).then((user) => {
        // Use return so that the catch clause can catch the error
        return user.generateAuthToken().then((token) => {
            res.header("x-auth", token).send(user);
        })
    }).catch((e) => {
        res.status(400).send();
    });

    // User.findOne({email: body.email.trim()}).then((user) => {
    //     if (!user) {
    //         console.log("User account not created for this email. Please sign up!");
    //         return res.status(404).send();
    //     }
    //     bcrypt.compare(body.password, user.password, (err, result) => {
    //         if (result) {
    //             res.status(200).send(user);
    //             console.log("Login Successful");
    //         } else {
    //             res.status(400).send("Password incorrect");
    //             console.log("Password incorrect");
    //         }
    //     });
    // }).catch((e) => {
    //     console.log(e);
    //     res.status(400).send(e);
    // })

})







app.listen(port, () => {
    console.log(`Started on port: ${port}`);
});


module.exports = {
    app
}

