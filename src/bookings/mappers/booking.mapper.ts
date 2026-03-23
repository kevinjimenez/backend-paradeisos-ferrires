import type { BookingResponse } from '../interfaces/booking-response.interface';

export class BookingMapper {
  static toResponse(id: string): BookingResponse {
    return { id };
  }
}
