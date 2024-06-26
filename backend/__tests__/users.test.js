const { beforeAll, describe, test, expect } = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../db");

describe("users", () => {
  let user;
  let token;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });
  
  test("can create user", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        name: "bruno",
        username: "misto",
        password: "12345"
      })
      .expect(201);

    user = response.body;
  });

  test("can get user", async () => {
    const response = await request(app)
      .get(`/api/users/${user.id}`)
      .expect(200);

    expect(response.body).not.toHaveProperty("passwordHash");
  });

  test("can authenticate", async () => {
    const response = await request(app)
      .post("/api/auth")
      .send({
        username: user.username,
        password: "12345"
      })
      .expect(200);

    token = response.body.token;
  });

  test("can update user", async () => {
    await request(app)
      .put(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "updated",
        username: "updated",
        password: "updated"
      })
      .expect(200);
  });

  test("can delete user", async () => {
    await request(app)
      .delete(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });
});
