process.env.NODE_ENV = "test";
const { expect } = require("chai");
const request = require("supertest");
const app = require("../app");
const connection = require("../db/connection");

describe("/api", () => {
  beforeEach(() => connection.seed.run());
  after(() => connection.destroy());
  describe("/topics", () => {
    it("GET / will give a status code of 200 after successful response", () => {
      return request(app)
        .get("/api/topics")
        .expect(200);
    });
    it("GET / will respond a topics array", () => {
      return request(app)
        .get("/api/topics")
        .then(topics_response => {
          expect(topics_response.body.topics).to.be.an("array");
          expect(topics_response.body.topics[0]).to.have.keys([
            "slug",
            "description"
          ]);
        });
    });
    it("GET / will respond with 404 Invalid request when the url is invalid", () => {
      return request(app)
        .get("/api/not-a-valid-url")
        .expect(404)
        .then(topics_response => {
          expect(topics_response.body.msg).to.equal("Route not found");
        });
    });
    it("GET / will respond with a 405 method not allowed when method requested is not valid", () => {
      const invalidMethods = ["patch", "put", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]("/api/topics")
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
  });
  describe("/users", () => {
    describe("/:username", () => {
      it("GET / with a status code 200 after successful response", () => {
        return request(app)
          .get("/api/users/icellusedkars")
          .expect(200);
      });
      it("GET / will respond with a user object", () => {
        return request(app)
          .get("/api/users/icellusedkars")
          .then(({ body: { user } }) => {
            expect(user).to.be.an("object");
            expect(user).to.have.keys(["username", "avatar_url", "name"]);
            expect(user.name).to.equal("sam");
          });
      });
      it("GET / will respond with invalid username when invalid user is requested", () => {
        return request(app)
          .get("/api/users/sadiyahKal")
          .expect(404)
          .then(({ body: { msg } }) => {
            console.log(msg);
            expect(msg).to.equal("Invalid username");
          });
      });
      it("GET / will respond with a 405 method not allowed when method requested is not valid", () => {
        const invalidMethods = ["patch", "put", "delete"];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]("/api/users/icellusedkars")
            .expect(405)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
    });
  });
  describe("/articles", () => {
    describe("/:article_id", () => {
      it("GET / will respond with a status code of 200", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200);
      });
      it("GET / will respond with an article object with required keys", () => {
        return request(app)
          .get("/api/articles/1")
          .then(({ body: { article } }) => {
            expect(article).to.be.an("array");
            expect(article[0]).to.have.keys([
              "author",
              "title",
              "article_id",
              "body",
              "topic",
              "created_at",
              "votes",
              "comment_count"
            ]);
            expect(article[0].author).to.equal("butter_bridge");
          });
      });
      it("GET / will respond with a 404 when an article doesn't exist", () => {
        return request(app)
          .get("/api/articles/999999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("Article doesn't exist");
          });
      });
      it("GET / will respond with a 400 Bad request when no article_id is specified", () => {
        return request(app)
          .get("/api/articles/notanid")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("Bad request");
          });
      });
      it("PATCH / will respond with a 200 when article has been updated with votes", () => {
        return request(app)
          .patch("/api/articles/2")
          .send({ inc_votes: 10 })
          .expect(200);
      });
      it("PATCH / will respond with with the updated article with votes updated", () => {
        return request(app)
          .patch("/api/articles/2")
          .send({ inc_votes: 10 })
          .then(({ body: { article } }) => {
            expect(article).to.be.an("object");
            expect(article.votes).to.equal(10);
            expect(article).to.contain.keys(["article_id", "body", "votes"]);
          });
      });
      it("PATCH / will respond with a 400 when request body does not contain inc_vote specifically and characters that do not match the required value", () => {
        return request(app)
          .patch("/api/articles/4")
          .send({ inc_votes: "ikra" })
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("Bad request");
          });
      });
      it("PATCH / will respond with a 400 when request body contain a spelling mistake but the correct key value pair of a number specified", () => {
        return request(app)
          .patch("/api/articles/3")
          .send({ incvotes: 67 })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("Bad request: Missing required field");
          });
      });
      it("PATCH / will respond with a 404 Not found when the article_id is not specified", () => {
        return request(app)
          .patch("/api/articles/")
          .send({ inc_votes: 8 })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("Route not found");
          });
      });
      it("PATCH / will respond with an updated votes value when other key value pairs are also in the body", () => {
        return request(app)
          .patch("/api/articles/5")
          .send({ inc_votes: 7, name: "Ikra" })
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.be.an("object");
            expect(article.votes).to.equal(7);
            expect(article).to.contain.keys(["article_id", "body", "votes"]);
          });
      });
      it("POST / will respond with status 201 to signal a successful post has completed", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send({
            username: "rogersop",
            body: "This article really speaks to me!"
          })
          .expect(201);
      });
      it("POST / will respond with a comment object with required keys", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send({
            username: "rogersop",
            body: "This article really speaks to me!"
          })
          .then(({ body: { comment } }) => {
            expect(comment).to.be.an("object");
            expect(comment).to.contain.keys(["body", "author", "article_id"]);
          });
      });
      it("POST / will respond with a 400 and returns no comment given when no body is given by the client specifying no comment", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send({})
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("Bad request: No comment given");
          });
      });
      it("POST / will respond with a 400 when the body object doesn't contain the correct keys", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send({
            myfriend: "rogersop",
            body: "This article really speaks to me!"
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("Bad request: No comment given");
          });
      });
      it("POST / will respond with a 404 Not found when the article_id is not specified", () => {
        return request(app)
          .patch("/api/articles/")
          .send({
            username: "rogersop",
            body: "I really liked this article - well done :)"
          })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("Route not found");
          });
      });
      it("POST / will respond with a 405 bad request when no article is specified in the url and therefore route not allowed", () => {
        return request(app)
          .post("/api/articles/comments")
          .send({
            username: "rogersop",
            body: "I really liked it :)"
          })
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("method not allowed");
          });
      });
      it("GET / will respond with 200 when array of comments is returned to client for a given article_id", () => {
        return request(app)
          .get("/api/articles/5/comments")
          .expect(200);
      });
      it.only("GET / will respond with an array of comments with the required keys", () => {
        return request(app)
          .get("/api/articles/5/comments")
          .then(({ body: { comments } }) => {
            expect(comments).to.be.an("array");
            expect(comments[0]).to.have.keys([
              "comment_id",
              "votes",
              "created_at",
              "author",
              "body"
            ]);
          });
      });
      it.only("GET / will respond with no article specified if no article id is specified in the url request", () => {
        return request(app)
          .get("/api/articles/789097/comments")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).equal("Article doesn't exist");
          });
      });
    });
  });
});
