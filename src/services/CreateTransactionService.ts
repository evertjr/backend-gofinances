// import AppError from '../errors/AppError';
import { getRepository, getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  private async findCategory(categoryTitle: string): Promise<Category> {
    const categoryRepository = getRepository(Category);

    const category = await categoryRepository.findOne({
      where: { title: categoryTitle },
    });

    if (category) {
      return category;
    }
    const newCategory = await categoryRepository.save(
      categoryRepository.create({
        title: categoryTitle,
      }),
    );
    return newCategory;
  }

  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);
    const loadTransactions = getCustomRepository(TransactionsRepository);

    const balance = await loadTransactions.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Insuficient funds');
    }

    const transactionObj = transactionsRepository.create({
      title,
      value,
      type,
      category: await this.findCategory(category),
    });

    await transactionsRepository.save(transactionObj);
    return transactionObj;
  }
}

export default CreateTransactionService;
