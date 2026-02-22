import { Prisma } from 'src/databases/generated/prisma/client';

export class SeatHoldsHistoryQueryBuilder {
  private selectConfig: Prisma.seat_holds_historySelect = {
    id: true,
    outbound_seat_hold_id: true,
    return_seat_hold_id: true,
    created_at: true,
  };

  withOutboundSeatHolds(): this {
    this.selectConfig.outbound_seat_holds = {
      select: this.buildSeatHoldRelations(),
    };
    return this;
  }

  withReturnSeatHolds(): this {
    this.selectConfig.return_seat_holds = {
      select: this.buildSeatHoldRelations(),
    };
    return this;
  }

  withAllRelations(): this {
    return this.withOutboundSeatHolds().withReturnSeatHolds();
  }

  build(): Prisma.seat_holds_historySelect {
    return this.selectConfig;
  }

  private buildSeatHoldRelations() {
    return {
      status: true,
      schedules: {
        select: {
          arrival_time: true,
          departure_time: true,
          ferries: {
            select: {
              name: true,
              register_code: true,
              type: true,
              amenities: true,
            },
          },
          routes: {
            select: {
              base_price_national: true,
            },
          },
        },
      },
    };
  }
}
