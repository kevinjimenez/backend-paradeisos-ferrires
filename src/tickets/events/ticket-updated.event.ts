import { TicketsStatus } from '../../databases/generated/prisma/enums';

export class TicketUpdatedEvent {
  constructor(
    public readonly ticketId: string,
    public readonly ticketsStatus: TicketsStatus,
    public readonly email: string,
  ) {}
}
