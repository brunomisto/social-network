const { beforeAll, describe, test, expect } = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../db");

describe("post", () => {
  let token;
  let user;
  let post;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    let response;

    response = await request(app)
      .post("/api/users")
      .send({
        username: "bruno",
        password: "12345",
        name: "Bruno"
      });

    user = response.body;

    response = await request(app)
      .post("/api/auth")
      .send({
        username: "bruno",
        password: "12345"
      });

    token = response.body.token;
  });
  
  test("can create post", async () => {
    const response = await request(app)
      .post("/api/posts")
      .send({
        content: "Hello world"
      })
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    post = response.body;

    expect(post.OwnerUserId).toBe(user.id);
  });

  test("can get all posts", async () => {
    const response = await request(app)
      .get("/api/posts")
      .expect(200);

    expect(response.body.postCount).toBe(1);
    expect(response.body.posts).toHaveLength(1);
  });

  test("can get single post", async () => {
    const response = await request(app)
      .get(`/api/posts/${post.id}`)
      .expect(200);

    expect(response.body.content).toBe("Hello world");
  });

  test("can update post", async () => {
    await request(app)
      .put(`/api/posts/${post.id}`)
      .send({
        content: "Hello world"
      })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });

  test("can delete post", async () => {
    await request(app)
      .delete(`/api/posts/${post.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });
});
