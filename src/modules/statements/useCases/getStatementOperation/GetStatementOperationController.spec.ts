import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

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

describe("GetStatementOperationController", () => {
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

  it("Should be to get a statement data by Id", async () => {
    const { token } = responseToken;

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${responseDeposit.body.id as string}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("Should not be to get a statement data with invalid Id", async () => {
    const { token } = responseToken;
    const fakeId = uuidv4();

    const response = await request(app)
      .get(`/api/v1/statements/${fakeId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});
