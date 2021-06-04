import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

const mockUser = {
  name: "Test",
  email: "test2@test.com",
  password: "1234",
};

describe("AuthenticateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(mockUser);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a session for a valid user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: mockUser.email,
      password: mockUser.password,
    });

    // console.log(response.body)
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  }, 30000);

  it("Should not be able to create a session for an inexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "wrong@error.com",
      password: mockUser.password,
    });

    // console.log(response.body)
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  }, 30000);

  it("Should not be able to create a session for a user with invalid password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: mockUser.email,
      password: "error",
    });

    // console.log(response.body)
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  }, 30000);
});
