const { test, beforeAll, expect } = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../db");

beforeAll(async () => {
  await sequelize.sync({ force: true });

  await request(app)
    .post("/api/users")
    .send({
      username: "misto",
      name: "Bruno",
      password: "12345"
    })
    .expect(201);
});

test("can authenticate", async () => {
  await request(app)
    .post("/api/auth")
    .send({
      username: "misto",
      password: "54321"
    })
    .expect(400);

  const response = await request(app)
    .post("/api/auth")
    .send({
      username: "misto",
      password: "12345"
    })
    .expect(200);

  expect(response.body).toHaveProperty("token");
});