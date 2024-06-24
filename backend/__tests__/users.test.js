const { test, beforeAll, expect, describe } = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../db");

let user;

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

  user = response.body;
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
    .get(`/api/users/${user.id}`)
    .expect(200);

  expect(response.body).toHaveProperty("id");
  expect(response.body).not.toHaveProperty("passwordHash");

  await request(app)
    .get(`/api/users/${user.id + 1}`)
    .expect(404);
});

describe("when authenticated", () => {
  let token;

  beforeAll(async() => {
    const response = await request(app)
      .post("/api/auth")
      .send({
        username: "misto",
        password: "12345"
      })
      .expect(200);

    token = response.body.token;
  });

  test("can update username/name", async () => {
    const response = await request(app)
      .put(`/api/users/${user.id}`)
      .send({
        username: "bruno",
        name: "misto"
      })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty("username");
    expect(response.body).toHaveProperty("name");
    expect(response.body.username).toBe("bruno");
    expect(response.body.name).toBe("misto");
  });

  test("can update password", async () => {
    await request(app)
      .put(`/api/users/${user.id}`)
      .send({
        password: "54321"
      })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    await request(app)
      .post("/api/auth")
      .send({
        username: "bruno",
        password: "12345"
      })
      .expect(400);

    await request(app)
      .post("/api/auth")
      .send({
        username: "bruno",
        password: "54321"
      })
      .expect(200);
  });

  test("can delete user", async () => {
    await request(app)
      .delete(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    await request(app)
      .get(`/api/users/${user.id}`)
      .expect(404);
  });

  describe("follow", () => {
    let followee, followed;
    
    beforeAll(async () => {
      let response;

      response = await request(app)
        .post("/api/users")
        .send({
          username: "foo",
          name: "foo",
          password: "12345"
        });

      followee = response.body;

      response = await request(app)
        .post("/api/auth")
        .send({
          username: "foo",
          password: "12345"
        });

      token = response.body.token;

      response = await request(app)
        .post("/api/users")
        .send({
          username: "bar",
          name: "bar",
          password: "12345"
        });

      followed = response.body;
    });

    test("can follow another user once", async () => {
      await request(app)
        .post(`/api/users/${followed.id}/follow`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);
  
      await request(app)
        .post(`/api/users/${followed.id}/follow`)
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });

    test("cant follow self", async () => {
      await request(app)
        .post(`/api/users/${followee.id}/follow`)
        .set("Authorization", `Bearer ${token}`)
        .expect(403);
    });

    test("can unfollow user", async () => {
      await request(app)
        .delete(`/api/users/${followed.id}/unfollow`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      await request(app)
        .delete(`/api/users/${followed.id}/unfollow`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });
});