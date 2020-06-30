import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(file: string): Promise<Transaction[]> {
    const readCSVStream = fs.createReadStream(file);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: Array<Request> = [];

    parseCSV.on('data', line => {
      const transaction = {
        title: line[0],
        type: line[1],
        value: parseFloat(line[2]),
        category: line[3],
      };
      lines.push(transaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactionService = new CreateTransactionService();

    const result = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const iterator of lines) {
      const t = await transactionService.execute(iterator);
      result.push(t);
    }

    await fs.promises.unlink(file);

    return result;
  }
}

export default ImportTransactionsService;
