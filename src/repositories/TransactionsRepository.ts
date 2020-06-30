import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const getIncome = await this.find({
      where: { type: 'income' },
    });

    const getOutcome = await this.find({
      where: { type: 'outcome' },
    });

    const income = getIncome.reduce((sum, record) => sum + record.value, 0);
    const outcome = getOutcome.reduce((sum, record) => sum + record.value, 0);
    const total = income - outcome;

    const balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
