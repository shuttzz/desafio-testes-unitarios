import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let userRepositoryInMemory: InMemoryUsersRepository;

describe("ShowUserProfileUseCase", () => {
  beforeEach(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      userRepositoryInMemory
    );
    showUserProfileUseCase = new ShowUserProfileUseCase(userRepositoryInMemory);
  });

  it("Should be able to get a user profile", async () => {
    const userData = {
      name: "User Test",
      email: "test@email.com",
      password: "secret",
    };
    const user = await createUserUseCase.execute(userData);
    await showUserProfileUseCase.execute(user.id as string);
  });

  it("Should not be able to get a profile data from a inexistent user", async () => {
    expect(async () => {
      const userData = {
        name: "User Test",
        email: "test@email.com",
        password: "secret",
      };
      const user = await createUserUseCase.execute(userData);
      await showUserProfileUseCase.execute(`error+${user.id as string}`);
    }).rejects.toBeInstanceOf(AppError);
  });
});
