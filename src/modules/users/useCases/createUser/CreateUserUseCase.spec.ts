import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("CreateUserUseCase", () => {
  beforeEach(async () => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "email@test.com",
      password: "1234",
    });
    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create a user with same email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Test",
        email: "email@test.com",
        password: "1234",
      });
      await createUserUseCase.execute({
        name: "User Test",
        email: "email@test.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
