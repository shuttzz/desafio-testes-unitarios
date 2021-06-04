import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("GetBalanceUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("Should be able to get a user's balance", async () => {
    const user = await usersRepository.create({
      email: "test@test.com",
      name: "test",
      password: "123",
    });

    const balanceData = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });
    expect(balanceData).toHaveProperty("balance");
  });

  it("Should not be able to get a balance from an inexistent user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "error",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
