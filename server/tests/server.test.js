const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb");

var {app} = require("./../server");
var {Todo} = require("./../models/todo");

const todos = [{                        //Prepopulate the db
    text: "First Test Todo",
    _id: new ObjectID ()
}, {
    text: "Second Test Todo",
    _id: new ObjectID (),
    completed: true,
    completedAt: 1234
}]


//Empty the Todo Database before each test. 
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);              //Insert the seed data
    }).then(() => done());
});

describe("POST /todos", () => {

    it("Should create a new todo", (done) => {
        var text = "Test Todo Text for Maple";
        
        request(app)
            .post("/todos")                             //Checking the POST request
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
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe("GET /todos/:id", () => {
    it("Should get todo by id", (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it("Should return 404 if todo not found", (done) => {
        var badID = new ObjectID();
        request(app)
            .get(`/todos/${badID.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it("Should return 404 if non-object id", (done) => {
        request(app)
            .get(`/todos/123`)
            .expect(404)
            .end(done);
    });

});


describe("DELETE /todos/:id", () => {
    it("Should remove a todo", (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
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

    it("Should return 404 if todo not found", (done) => {
        var badID = new ObjectID();
        request(app)
            .delete(`/todos/${badID.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it("Should return 404 if non-object id", (done) => {
        request(app)
            .delete(`/todos/123`)
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

    it("Should clear completedAt when todo is not completed", (done) => {
        var hexId = todos[1]._id.toHexString();
        var requestBody = {
            text: "Another new text from Kathy",
            completed: false
        };

        request(app)
            .patch(`/todos/${hexId}`)
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


})





