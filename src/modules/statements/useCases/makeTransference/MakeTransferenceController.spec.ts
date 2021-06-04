import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import { User } from "../../../users/entities/User";
import { Statement } from "../../entities/Statement";
import { MakeTransferenceError } from "./MakeTransferenceError";

let connection: Connection;

const mockUser1 = {
  id: "",
  name: "Fred Ortiz",
  email: "fred.ortiz@jepso.ki",
  password: "123",
};

const mockUser2 = {
  id: "",
  name: "Rebecca Phelps",
  email: "rebecca.phelps@naduw.cx",
  password: "123",
};

interface IResponseToken {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface IBalanceResult {
  statement: Statement[];
  balance: number;
}

let responseToken: IResponseToken;

describe("MakeTransferenceController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(mockUser1);
    await request(app).post("/api/v1/users").send(mockUser2);

    const response = await request(app).post("/api/v1/sessions").send({
      email: mockUser1.email,
      password: mockUser1.password,
    });
    responseToken = response.body;

    const { token } = responseToken;

    const resultProfile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });
    const { id } = resultProfile.body as User;
    mockUser1.id = id as string;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to make a transference between two users", async () => {
    const { token: token1 } = responseToken;
    const amount = 20;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount,
        description: "Funds",
      })
      .set({
        Authorization: `Bearer ${token1}`,
      });

    const resultToken = await request(app).post("/api/v1/sessions").send({
      email: mockUser2.email,
      password: mockUser2.password,
    });
    const { token: token2 } = resultToken.body as IResponseToken;
    const resultProfile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token2}`,
      });
    const { id } = resultProfile.body as User;
    mockUser2.id = id as string;

    await request(app)
      .post(`/api/v1/statements/transfers/${mockUser2.id}`)
      .send({
        amount,
        description: "Test",
      })
      .set({
        Authorization: `Bearer ${token1}`,
      });

    const statementResult = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token2}`,
      });

    const { balance, statement } = statementResult.body as IBalanceResult;
    expect(balance).toBe(amount);
    expect(statement).toHaveLength(1);
  });

  it("Should not be able to make a transference with sender equals to receiver", async () => {
    const { token } = responseToken;
    const amount = 20;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount,
        description: "Funds",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const result = await request(app)
      .post(`/api/v1/statements/transfers/${mockUser1.id}`)
      .send({
        amount,
        description: "Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const error = new MakeTransferenceError.SenderEqualsToReceiver();

    expect(result.status).toEqual(error.statusCode);
    expect(result.body).toHaveProperty("message");
    expect(result.body.message).toEqual(error.message);
  });

  it("Should not be able to make a transference when have insufficient funds", async () => {
    const { token } = responseToken;
    const amount = 2000;

    const result = await request(app)
      .post(`/api/v1/statements/transfers/${mockUser2.id}`)
      .send({
        amount,
        description: "Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const error = new MakeTransferenceError.InsufficientFunds();

    expect(result.status).toEqual(error.statusCode);
    expect(result.body).toHaveProperty("message");
    expect(result.body.message).toEqual(error.message);
  });

  it("Should not be able to make a transference to inexistent user", async () => {
    const { token } = responseToken;
    const amount = 1;

    const fakeId = uuidV4();

    const result = await request(app)
      .post(`/api/v1/statements/transfers/${fakeId}`)
      .send({
        amount,
        description: "Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const error = new MakeTransferenceError.ReceiverNotFound();

    expect(result.status).toEqual(error.statusCode);
    expect(result.body).toHaveProperty("message");
    expect(result.body.message).toEqual(error.message);
  });
});
