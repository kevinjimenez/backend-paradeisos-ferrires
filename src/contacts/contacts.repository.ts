import { DatabasesService } from './../databases/databases.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { Prisma } from 'src/databases/generated/prisma/client';

@Injectable()
export class ContactsRepository extends BaseRepository<Prisma.contactsModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'contacts';
  }

  protected get db(): PrismaTransaction {
    return this.databasesService;
  }

  async upsertByDocument(
    data: Prisma.contactsCreateInput,
    tx?: PrismaTransaction,
  ): Promise<Prisma.contactsModel> {
    const database = tx ?? this.db;
    return database.contacts.upsert({
      where: {
        document_number: data.document_number,
      },
      create: data,
      update: data,
    });
  }
}
