const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb");

var {app} = require("./../server");
var {Todo} = require("./../models/todo");
const {todos, populateTodos, users, populateUsers} = require("./seed/seed");
var {User} = require("./../models/user");


//Empty the Todo Database before each test. 
beforeEach(populateUsers);
beforeEach(populateTodos);


describe("POST /todos", () => {

    it("Should create a new todo", (done) => {
        var text = "Test Todo Text for Maple";
        
        request(app)
            .post("/todos")                             //Checking the POST request
            .set("x-auth", users[0].tokens[0].token)
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                
                Todo.find({text}).then((todos) => {           //Checking the Todo collection
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));               //If there is no catch, the above tests can still pass
            });
    });

    it("should not create todo with invalid body data", (done) => {
        request(app)
            .post("/todos")
            .set("x-auth", users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });

});

describe("GET /todos", () => {
    it("Should get all todos", (done) => {
        request(app)
            .get("/todos")
            .set("x-auth", users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    });
});

describe("GET /todos/:id", () => {
    it("Should get todo by id", (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set("x-auth", users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it("Should not be able to get todo from another user", (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set("x-auth", users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it("Should return 404 if todo not found", (done) => {
        var badID = new ObjectID();
        request(app)
            .get(`/todos/${badID.toHexString()}`)
            .set("x-auth", users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it("Should return 404 if non-object id", (done) => {
        request(app)
            .get(`/todos/123`)
            .set("x-auth", users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

});


describe("DELETE /todos/:id", () => {
    it("Should remove a todo", (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set("x-auth", users[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it("Should not remove a todo not created by the user", (done) => {
        var hexId = todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set("x-auth", users[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it("Should return 404 if todo not found", (done) => {
        var badID = new ObjectID();
        request(app)
            .delete(`/todos/${badID.toHexString()}`)
            .set("x-auth", users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it("Should return 404 if non-object id", (done) => {
        request(app)
            .delete(`/todos/123`)
            .set("x-auth", users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

});


describe("PATCH /todos/:id", () => {

    it("Should update the todo", (done) => {
        var hexId = todos[0]._id.toHexString();
        var requestBody = {
            text: "New Text from Maple",
            completed: true
        };

        request(app)
            .patch(`/todos/${hexId}`)
            .set("x-auth", users[0].tokens[0].token)
            .send(requestBody)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(requestBody.text);
                expect(res.body.todo.completed).toBe(requestBody.completed);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo.text).toBe(requestBody.text);
                    expect(todo.completed).toBe(true);
                    expect(todo.completedAt).toBeA('number');
                    done();
                }).catch((e) => done(e));
            })
        
    });

    it("Should not update the todo by another user", (done) => {
        var hexId = todos[0]._id.toHexString();
        var requestBody = {
            text: "New Text from Maple",
            completed: true
        };

        request(app)
            .patch(`/todos/${hexId}`)
            .set("x-auth", users[1].tokens[0].token)
            .send(requestBody)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo.text).toNotBe(requestBody.text);
                    expect(todo.completed).toNotBe(true);
                    expect(todo.completedAt).toNotExist();
                    done();
                }).catch((e) => done(e));
            })
        
    });

    it("Should clear completedAt when todo is not completed", (done) => {
        var hexId = todos[1]._id.toHexString();
        var requestBody = {
            text: "Another new text from Kathy",
            completed: false
        };

        request(app)
            .patch(`/todos/${hexId}`)
            .set("x-auth", users[1].tokens[0].token)
            .send(requestBody)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(requestBody.text);
                expect(res.body.todo.completed).toBe(requestBody.completed);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo.text).toBe(requestBody.text);
                    expect(todo.completed).toBe(false);
                    expect(todo.completedAt).toNotExist();
                    done();
                }).catch((e) => done(e));
            })
    });
});

describe("GET /users/me", () => {

    it("Should return user if authenticated", (done) => {
        request(app)
            .get("/users/me")
            .set("x-auth", users[0].tokens[0].token)    //Setting the header for the get Request
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it("Should return a 401 if not authenticated", (done) => {
        request(app)
            .get("/users/me")
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);

    })
});

describe("POST /users", () => {
    it("Should be able to create a new user", (done) => {
        var email = "quuez123@gmail.com";
        var password = "123456";
        request(app)
            .post("/users")
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers["x-auth"]).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {                 //Check the database to see if the user was actually created
                if (err) {
                    return done(err);
                }
                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it("Should return validation errors if input is not in correct format", (done) => {
        var email = "hellohello";
        var password = "123";
        request(app)
            .post("/users")
            .send({email, password})
            .expect(400)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                User.findOne({email}).then((user) => {
                    expect(user).toNotExist();
                    done();
                })
            })
    });

    it("Should not create user if email is already used", (done) => {
        var email = users[0].email;
        var password = users[0].password;
        request(app)
            .post("/users")
            .send({email, password})
            .expect(400)
            .end(done)
    });
});

describe("POST /users/login", () => {

    it("Should login in user and return auth token", (done) => {
        request(app)
            .post("/users/login")
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers["x-auth"]).toExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1]).toInclude({
                        access: "auth",
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));   //To catch the error when expect fails

            })

    });

    it("Should reject invalid login", (done) => {
        request(app)
            .post("/users/login")
            .send({
                email: users[1].email,
                password: "wrongPassword"
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers["x-auth"]).toNotExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            })
    });
});

describe("DELETE /users/me/token", (done) => {
    it("Should remove auth token on logout", (done) => {
        request(app)
            .delete("/users/me/token")
            .set("x-auth", users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});





