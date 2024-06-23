const { test, beforeAll, expect } = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../db");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

test("can create user", async () => {
  const response = await request(app)
    .post("/api/users")
    .send({
      username: "misto",
      name: "Bruno",
      password: "12345"
    })
    .expect(201);

  expect(response.body).toHaveProperty("id");
  expect(response.body).not.toHaveProperty("passwordHash");
});

test("user must be valid", async () => {
  const response = await request(app)
    .post("/api/users")
    .send({
      username: "",
      name: "",
      password: "123"
    })
    .expect(400);

  expect(response.body).toHaveProperty("error");
  expect(response.body.error).toBe("Missing field(s)");
});

test("can get existing user", async () => {
  const response = await request(app)
    .get("/api/users/1")
    .expect(200);

  expect(response.body).toHaveProperty("id");
  expect(response.body).not.toHaveProperty("passwordHash");

  await request(app)
    .get("/api/users/2")
    .expect(404);
});