import {
  PaymentMethod,
  PaymentStatus,
} from './../databases/generated/prisma/enums';
import { PrismaTransaction } from './../common/types/prisma-transaction.type';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base/base.repository';
import { Prisma } from 'src/databases/generated/prisma/client';
import { DatabasesService } from './../databases/databases.service';
import { PaymentQueryBuilder } from './builders/payment-query.builder';

@Injectable()
export class PaymentsRepository extends BaseRepository<Prisma.paymentsModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'payments';
  }

  protected get db() {
    return this.databasesService;
  }

  async findByIdWithTicket(id: string, tx?: PrismaTransaction) {
    const database = tx || this.db;
    return database.payments.findUnique({
      where: { id },
      include: new PaymentQueryBuilder().withTicketDetails().build(),
    });
  }

  async findAllWithTickets(tx?: PrismaTransaction) {
    const database = tx || this.db;
    return database.payments.findMany({
      include: new PaymentQueryBuilder().withTickets().build(),
    });
  }

  async findByTicketId(ticketId: string, tx?: PrismaTransaction) {
    const database = tx || this.db;
    return database.payments.findMany({
      where: {
        ticket_id: ticketId,
      },
    });
  }

  async findByStatus(status: PaymentStatus, tx?: PrismaTransaction) {
    const database = tx || this.db;
    return database.payments.findMany({
      where: { status },
      include: new PaymentQueryBuilder().withTickets().build(),
    });
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    tx?: PrismaTransaction,
  ) {
    const database = tx || this.db;
    return database.payments.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
      },
    });
  }

  async createPending(
    ticketId: string,
    amount: number,
    tx?: PrismaTransaction,
    paymentMethod: PaymentMethod = PaymentMethod.credit_card,
  ) {
    const database = tx || this.db;
    return database.payments.create({
      data: {
        ticket_id: ticketId,
        payment_provider: '',
        amount,
        payment_method: paymentMethod,
        status: PaymentStatus.pending,
        created_at: new Date(),
      },
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    tx?: PrismaTransaction,
  ) {
    const database = tx || this.db;
    return database.payments.findMany({
      where: {
        created_at: { gte: startDate, lte: endDate },
      },
      include: new PaymentQueryBuilder().withTickets().build(),
    });
  }
}
