import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // TODO
    const transactionsRepository = getRepository(Transaction);

    if (!(await transactionsRepository.findOne(id))) {
      throw new AppError('Transaction not found', 401);
    }

    await transactionsRepository.delete({ id });
  }
}

export default DeleteTransactionService;
