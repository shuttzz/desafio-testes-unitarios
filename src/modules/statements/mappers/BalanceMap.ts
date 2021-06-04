import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({
    statement,
    balance,
  }: {
    statement: Statement[];
    balance: number;
  }) {
    const parsedStatement = statement.map(
      ({ id, amount, description, type, created_at, updated_at, transfer }) => {
        const statementView = {
          id,
          amount: Number(amount),
          description,
          type,
          created_at,
          updated_at,
        };

        if (transfer) {
          if (type === "transfer_in") {
            Object.assign(statementView, {
              sender_id: transfer.user_id,
            });
          }
          if (type === "transfer_out") {
            Object.assign(statementView, {
              receiver_id: transfer.user_id,
            });
          }
        }

        return statementView;
      }
    );

    return {
      statement: parsedStatement,
      balance: Number(balance),
    };
  }
}
