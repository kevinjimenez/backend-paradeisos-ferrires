export interface CreateSeatHold {
  scheduleId: string;
  seatsToReserve: number;
  holdExpiresAt: Date;
}
