import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

const mockUser = {
  name: "Test",
  email: "test3@test.com",
  password: "1234",
};

describe("ShowUserProfileController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(mockUser);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get a profile for a valid user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: mockUser.email,
      password: mockUser.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able to get a profile for a unauthenticated user", async () => {
    const response = await request(app).get("/api/v1/profile");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("Should not be able to get a profile for a user with invalid token", async () => {
    const token = "wrong";

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });
});
