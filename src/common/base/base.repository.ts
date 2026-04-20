/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { PrismaTransaction } from '../types/prisma-transaction.type';
import { handlePrismaError } from '../utils/prisma-error.handler';

export abstract class BaseRepository<TModel> {
  protected abstract get modelName(): string;
  protected abstract get db(): PrismaTransaction;

  async findById(id: string, tx?: PrismaTransaction): Promise<TModel | null> {
    const database = tx ?? this.db;

    return database[this.modelName].findUnique({
      where: { id },
    });
  }

  async findAll(tx?: PrismaTransaction): Promise<TModel[]> {
    const database = tx ?? this.db;
    return database[this.modelName].findMany();
  }

  async create(data: unknown, tx?: PrismaTransaction): Promise<TModel> {
    const database = tx ?? this.db;
    try {
      return await database[this.modelName].create({ data });
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async update(
    id: string,
    data: unknown,
    tx?: PrismaTransaction,
  ): Promise<TModel> {
    const database = tx ?? this.db;
    try {
      return await database[this.modelName].update({
        where: { id },
        data,
      });
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async delete(id: string, tx?: PrismaTransaction): Promise<TModel> {
    const database = tx ?? this.db;
    try {
      return await database[this.modelName].delete({
        where: { id },
      });
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async count(where?: unknown, tx?: PrismaTransaction): Promise<number> {
    const database = tx ?? this.db;

    return database[this.modelName].count({ where });
  }

  async exists(id: string, tx?: PrismaTransaction): Promise<boolean> {
    const record = await this.findById(id, tx);
    return record !== null;
  }
}
