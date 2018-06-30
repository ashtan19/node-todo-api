const expect = require("expect");
const request = require("supertest");

var {app} = require("./../server");
var {Todo} = require("./../models/todo");

//Empty the Todo Database before each test. 
beforeEach((done) => {
    Todo.remove({}).then(() => done());
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
                
                Todo.find().then((todos) => {           //Checking the Todo collection
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
                    expect(todos.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });

});