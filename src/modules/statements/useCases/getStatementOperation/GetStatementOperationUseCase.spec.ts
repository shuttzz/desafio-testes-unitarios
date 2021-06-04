import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperation: GetStatementOperationUseCase;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;

describe("GetStatmentOperation", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperation = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("Should be able to get details for a operation statement for a existent user", async () => {
    const user = await usersRepository.create({
      email: "test@test.com",
      name: "Test",
      password: "123",
    });

    const deposit = await statementsRepository.create({
      amount: 10,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const statement = await getStatementOperation.execute({
      statement_id: deposit.id as string,
      user_id: user.id as string,
    });

    expect(statement.description).toStrictEqual(deposit.description);
    expect(statement.amount).toStrictEqual(deposit.amount);
  });

  it("Should not be able to get details for a operation statement for a inexistent user", () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: "test@test.com",
        name: "Test",
        password: "123",
      });

      const deposit = await statementsRepository.create({
        amount: 10,
        description: "test",
        type: OperationType.DEPOSIT,
        user_id: user.id as string,
      });

      const statement = await getStatementOperation.execute({
        statement_id: deposit.id as string,
        user_id: "error",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get details for a operation statement for a inexistent user", () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: "test@test.com",
        name: "Test",
        password: "123",
      });

      const deposit = await statementsRepository.create({
        amount: 10,
        description: "test",
        type: OperationType.DEPOSIT,
        user_id: user.id as string,
      });

      const statement = await getStatementOperation.execute({
        statement_id: "error",
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
