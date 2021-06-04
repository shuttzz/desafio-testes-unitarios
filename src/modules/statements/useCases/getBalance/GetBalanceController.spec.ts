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

describe("GetBalanceController", () => {
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

  it("Should be able to get all statements for a authenticated user", async () => {
    const { token } = responseToken;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: "test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body.statement).toHaveLength(2);
  }, 30000);

  it("Should not be able to get all statements for a unauthenticated user", async () => {
    const response = await request(app).get("/api/v1/statements/balance");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  }, 30000);
});
