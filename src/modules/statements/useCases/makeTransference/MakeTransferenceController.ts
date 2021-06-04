import { Request, Response } from "express";
import { container } from "tsyringe";

import { MakeTransferenceUseCase } from "./MakeTransferenceUseCase";

class MakeTransferenceController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { amount, description } = request.body;
    const { id: sender_id } = request.user;
    const { user_id: receiver_id } = request.params;

    const makeTransferenceUseCase = container.resolve(MakeTransferenceUseCase);
    await makeTransferenceUseCase.execute({
      sender_id,
      receiver_id,
      amount,
      description,
    });

    return response.status(201).send();
  }
}

export { MakeTransferenceController };
