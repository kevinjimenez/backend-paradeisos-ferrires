export class TicketCreatedEvent {
  constructor(
    public readonly ticketId: string,
    public readonly contactId: string,
    public readonly total: number,
    public readonly subtotal: number,
    public readonly taxes: number,
    public readonly serviceFee: number,
    public readonly discount: number,
  ) {}
}
