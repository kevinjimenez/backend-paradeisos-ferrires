/* eslint-disable @typescript-eslint/require-await */
import { PrismaTransaction } from '../types/prisma-transaction.type';

export abstract class BaseRepository<TModel> {
  protected abstract get modelName(): string;
  protected abstract get db(): PrismaTransaction;

  async findById(id: string, tx?: PrismaTransaction): Promise<TModel | null> {
    const database = tx ?? this.db;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return database[this.modelName].findUnique({
      where: { id },
    });
  }

  async findAll(tx?: PrismaTransaction): Promise<TModel[]> {
    const database = tx ?? this.db;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return database[this.modelName].findMany();
  }

  async create(data: unknown, tx?: PrismaTransaction): Promise<TModel> {
    const database = tx ?? this.db;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return database[this.modelName].create({ data });
  }

  async update(
    id: string,
    data: unknown,
    tx?: PrismaTransaction,
  ): Promise<TModel> {
    const database = tx ?? this.db;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return database[this.modelName].update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tx?: PrismaTransaction): Promise<TModel> {
    const database = tx ?? this.db;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return database[this.modelName].delete({
      where: { id },
    });
  }

  async count(where?: unknown, tx?: PrismaTransaction): Promise<number> {
    const database = tx ?? this.db;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return database[this.modelName].count({ where });
  }

  async exists(id: string, tx?: PrismaTransaction): Promise<boolean> {
    const record = await this.findById(id, tx);
    return record !== null;
  }
}
