import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let createStatementUseCase: CreateStatementUseCase;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;

describe("CreateStatementUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("Should be able to create a new deposit for a user", async () => {
    const user = await usersRepository.create({
      email: "test@test.com",
      name: "test",
      password: "123",
    });

    const statement: ICreateStatementDTO = {
      user_id: user.id as string,
      description: "test",
      amount: 10,
      type: OperationType.DEPOSIT,
    };
    await createStatementUseCase.execute(statement);
  });

  it("Should not be able to create a new deposit for an inexistent user", async () => {
    expect(async () => {
      const statement: ICreateStatementDTO = {
        user_id: "error",
        description: "test",
        amount: 10,
        type: OperationType.DEPOSIT,
      };
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be able to create a new withdraw for a user", async () => {
    const user = await usersRepository.create({
      email: "test@test.com",
      name: "test",
      password: "123",
    });

    const deposit: ICreateStatementDTO = {
      user_id: user.id as string,
      description: "test",
      amount: 10,
      type: OperationType.DEPOSIT,
    };
    await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id: user.id as string,
      description: "test",
      amount: 10,
      type: OperationType.WITHDRAW,
    };
    await createStatementUseCase.execute(withdraw);
  });

  it("Should not be able to create a new withdraw for a user with insufficient funds", () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: "test@test.com",
        name: "test",
        password: "123",
      });

      const deposit: ICreateStatementDTO = {
        user_id: user.id as string,
        description: "test",
        amount: 10,
        type: OperationType.DEPOSIT,
      };
      await createStatementUseCase.execute(deposit);

      const withdraw: ICreateStatementDTO = {
        user_id: user.id as string,
        description: "test",
        amount: 20,
        type: OperationType.WITHDRAW,
      };
      await createStatementUseCase.execute(withdraw);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
