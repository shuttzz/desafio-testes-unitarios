import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { MakeTransferenceError } from "./MakeTransferenceError";

interface IRequest {
  sender_id: string;
  receiver_id: string;
  amount: number;
  description: string;
}

@injectable()
class MakeTransferenceUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,

    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    sender_id,
    receiver_id,
    amount,
    description,
  }: IRequest): Promise<void> {
    if (sender_id === receiver_id) {
      throw new MakeTransferenceError.SenderEqualsToReceiver();
    }

    const receiver = await this.usersRepository.findById(receiver_id);
    if (!receiver) {
      throw new MakeTransferenceError.ReceiverNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });
    if (balance < amount) {
      throw new MakeTransferenceError.InsufficientFunds();
    }

    const statement_in = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER_IN,
      user_id: receiver_id,
    });

    const statement_out = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER_OUT,
      user_id: sender_id,
    });

    await this.statementsRepository.setTransferId(
      String(statement_in.id),
      String(statement_out.id)
    );

    await this.statementsRepository.setTransferId(
      String(statement_out.id),
      String(statement_in.id)
    );
  }
}

export { MakeTransferenceUseCase };
