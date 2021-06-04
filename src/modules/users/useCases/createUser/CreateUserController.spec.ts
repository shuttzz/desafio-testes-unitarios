import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("CreateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Test",
      email: "test@test.com",
      password: "1234",
    });
    expect(response.status).toBe(201);
  });

  it("Should not be able to create a user with email used before", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test",
      email: "test@test.com",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "Test",
      email: "test@test.com",
      password: "1234",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});
