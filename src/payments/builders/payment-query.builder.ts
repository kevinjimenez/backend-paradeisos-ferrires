import { Prisma } from 'src/databases/generated/prisma/client';

export class PaymentQueryBuilder {
  private includeConfig: Prisma.paymentsInclude = {};

  withTickets(): this {
    this.includeConfig.tickets = true;
    return this;
  }

  withTicketDetails(): this {
    this.includeConfig.tickets = {
      include: {
        contacts: true,
        passengers: true,
      },
    };
    return this;
  }

  build() {
    return this.includeConfig;
  }
}
