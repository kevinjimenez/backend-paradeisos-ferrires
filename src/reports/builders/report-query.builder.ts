import { Prisma } from './../../databases/generated/prisma/client';

export class ReportQueryBuilder {
  private selectConfig: Prisma.ticketsSelect = {
    ticket_code: true,
    status: true,
    trip_type: true,
    total: true,
    currency: true,
    created_at: true,
  };

  withContact(): this {
    this.selectConfig.contacts = {
      select: {
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        document_type: true,
        document_number: true,
      },
    };
    return this;
  }

  withPassengers(): this {
    this.selectConfig.passengers = {
      select: {
        first_name: true,
        last_name: true,
        document_type: true,
        document_number: true,
        date_of_birth: true,
        checked_in_outbound: true,
        checked_in_return: true,
        checked_in_outbound_at: true,
        checked_in_return_at: true,
      },
    };
    return this;
  }

  withSchedules(): this {
    const scheduleSelect = {
      select: {
        departure_date: true,
        departure_time: true,
        routes: {
          select: {
            origin_islands: { select: { name: true } },
            destination_islands: { select: { name: true } },
          },
        },
        ferries: { select: { name: true } },
      },
    };

    this.selectConfig.outbound_schedules = scheduleSelect;
    this.selectConfig.return_schedules = scheduleSelect;
    return this;
  }

  withPayments(): this {
    this.selectConfig.payments = {
      select: {
        payment_method: true,
        status: true,
        amount: true,
        paid_at: true,
      },
    };
    return this;
  }

  withAllRelations(): this {
    return this.withContact().withPassengers().withSchedules().withPayments();
  }

  build(): Prisma.ticketsSelect {
    return this.selectConfig;
  }
}
