import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

const mockUser = {
  name: "Test",
  email: "test3@test.com",
  password: "1234",
};

interface IResponseToken {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

let responseToken: IResponseToken;

describe("CreateStatementController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(mockUser);

    const response = await request(app).post("/api/v1/sessions").send({
      email: mockUser.email,
      password: mockUser.password,
    });
    responseToken = response.body;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be to create a new deposit for a user", async () => {
    const { token } = responseToken;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("Should be to create a new withdraw for a user", async () => {
    const { token } = responseToken;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: "test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("Should not be to create a new withdraw for a user with insufficient funds", async () => {
    const { token } = responseToken;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});
