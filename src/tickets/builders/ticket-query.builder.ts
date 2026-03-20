import { Prisma } from './../../databases/generated/prisma/client';

export class TicketQueryBuilder {
  private selectConfig: Prisma.ticketsSelect = {
    id: true,
    status: true,
    ticket_code: true,
    qr_code: true,
  };

  withPassengers(): this {
    this.selectConfig.passengers = {
      select: {
        first_name: true,
        last_name: true,
        document_number: true,
      },
    };
    return this;
  }

  withOutboundSchedule(): this {
    this.selectConfig.outbound_schedules = {
      select: {
        departure_date: true,
        departure_time: true,
        arrival_time: true,
        routes: {
          select: {
            origin_ports: {
              select: {
                name: true,
                code: true,
                islands: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            destination_ports: {
              select: {
                name: true,
                code: true,
                islands: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        ferries: {
          select: {
            name: true,
          },
        },
      },
    };
    return this;
  }

  withReturnSchedule(): this {
    this.selectConfig.return_schedules = {
      select: {
        departure_date: true,
        departure_time: true,
        arrival_time: true,
        routes: {
          select: {
            origin_ports: {
              select: {
                name: true,
                code: true,
                islands: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            destination_ports: {
              select: {
                name: true,
                code: true,
                islands: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        ferries: {
          select: {
            name: true,
          },
        },
      },
    };
    return this;
  }

  withAllRelations(): this {
    return this.withPassengers().withOutboundSchedule().withReturnSchedule();
  }

  build(): Prisma.ticketsSelect {
    return this.selectConfig;
  }
}
