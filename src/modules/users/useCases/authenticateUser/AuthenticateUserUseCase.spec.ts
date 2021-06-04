import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let authenticateUSerUseCase: AuthenticateUserUseCase;

describe("AuthenticateUserUseCase", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUSerUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
  });

  it("Should be able to authenticate a user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "email@test.com",
      password: "1234",
    });

    const data = await authenticateUSerUseCase.execute({
      email: "email@test.com",
      password: "1234",
    });
  });

  it("Should not be able to authenticate a inexistent user", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User Test",
        email: "email@test.com",
        password: "1234",
      });
      const data = await authenticateUSerUseCase.execute({
        email: "error@test.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to authenticate with wrong password", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User Test",
        email: "email@test.com",
        password: "1234",
      });
      const data = await authenticateUSerUseCase.execute({
        email: "email@test.com",
        password: "12345",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
