export interface CreateSeatHoldParams {
  scheduleId: string;
  seatsToReserve: number;
  holdExpiresAt: Date;
}
