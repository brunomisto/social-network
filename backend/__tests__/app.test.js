const { test, beforeAll, expect, describe } = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../db");

beforeAll(async () => {
  await sequelize.sync({ force: true });
  console.log("cleaned db");
});

describe("users", () => {
  let user;
  
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
          .post(`/api/follows/${followed.id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(204);
    
        await request(app)
          .post(`/api/follows/${followed.id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(400);
      });
  
      test("cant follow self", async () => {
        await request(app)
          .post(`/api/follows/${followee.id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(403);
      });
  
      test("can get user follows", async () => {
        const response = await request(app)
          .get(`/api/follows/${followed.id}`)
          .expect(200);
  
        expect(response.body).toHaveProperty("followers");
        expect(response.body).toHaveProperty("following");
        expect(response.body.followers).toHaveLength(1);
        expect(response.body.following).toHaveLength(0);
      });
  
      test("can unfollow user", async () => {
        await request(app)
          .delete(`/api/follows/${followed.id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(204);
  
        await request(app)
          .delete(`/api/follows/${followed.id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(404);
      });
    });

    describe("posts", () => {
      let post;

      beforeAll(async() => {
        // Create a user and authenticate to get a token
        const response = await request(app)
        .post("/api/users")
        .send({
          username: "postTester",
          name: "Post Tester",
          password: "12345"
        });

        user = response.body;

        const authResponse = await request(app)
          .post("/api/auth")
          .send({
            username: "postTester",
            password: "12345"
          });

        token = authResponse.body.token;
      });

      test("can create a post", async () => {
        const response = await request(app)
          .post("/api/posts")
          .send({ content: "Hello, world!" })
          .set("Authorization", `Bearer ${token}`)
          .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.content).toBe("Hello, world!");
        expect(response.body.OwnerUserId).toBe(user.id);
        
        post = response.body;
      });

      test("cannot create a post without content", async () => {
        const response = await request(app)
          .post("/api/posts")
          .send({})
          .set("Authorization", `Bearer ${token}`)
          .expect(400);

        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("Missing content");
      });

      test("can get all posts", async () => {
        const response = await request(app)
          .get("/api/posts")
          .expect(200);

        expect(response.body).toHaveProperty("postCount");
        expect(response.body).toHaveProperty("posts");
        expect(response.body.posts).toHaveLength(1); // We created one post
      });

      test("can get a post by id", async () => {
        const response = await request(app)
          .get(`/api/posts/${post.id}`)
          .expect(200);

        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toBe(post.id);
      });

      test("returns 404 for a non-existent post", async () => {
        await request(app)
          .get("/api/posts/99999")
          .expect(404);
      });

      test("can update a post", async () => {
        const response = await request(app)
          .put(`/api/posts/${post.id}`)
          .send({ content: "Updated content" })
          .set("Authorization", `Bearer ${token}`)
          .expect(200);

        expect(response.body).toHaveProperty("content");
        expect(response.body.content).toBe("Updated content");
      });

      test("cannot update a post without content", async () => {
        const response = await request(app)
          .put(`/api/posts/${post.id}`)
          .send({})
          .set("Authorization", `Bearer ${token}`)
          .expect(400);

        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("Missing content");
      });

      test("cannot update another user's post", async () => {
        // Create a second user and authenticate to get a token
        await request(app)
          .post("/api/users")
          .send({
            username: "anotherUser",
            name: "Another User",
            password: "12345"
          });

        const secondAuthResponse = await request(app)
          .post("/api/auth")
          .send({
            username: "anotherUser",
            password: "12345"
          });

        const secondUserToken = secondAuthResponse.body.token;

        await request(app)
          .put(`/api/posts/${post.id}`)
          .send({ content: "Illegal update" })
          .set("Authorization", `Bearer ${secondUserToken}`)
          .expect(403);
      });

      test("can delete a post", async () => {
        await request(app)
          .delete(`/api/posts/${post.id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(204);

        await request(app)
          .get(`/api/posts/${post.id}`)
          .expect(404);
      });

      test("cannot delete another user's post", async () => {
        // Create a new post
        const newPostResponse = await request(app)
          .post("/api/posts")
          .send({ content: "This post will be attempted to delete by another user" })
          .set("Authorization", `Bearer ${token}`);
        
        const newPost = newPostResponse.body;

        // Authenticate second user
        const secondUserResponse = await request(app)
          .post("/api/auth")
          .send({
            username: "anotherUser",
            password: "12345"
          });

        const secondUserToken = secondUserResponse.body.token;

        await request(app)
          .delete(`/api/posts/${newPost.id}`)
          .set("Authorization", `Bearer ${secondUserToken}`)
          .expect(403);

        // Cleanup
        await request(app)
          .delete(`/api/posts/${newPost.id}`)
          .set("Authorization", `Bearer ${token}`)
          .expect(204);
      });
    });
  });
});
