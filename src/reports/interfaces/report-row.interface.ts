export type ReportDirection = 'outbound' | 'return';

export interface ReportRow {
  ticketCode: string;
  ticketStatus: string;
  tripType: string;
  purchasedAt: Date;

  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  buyerDocumentType: string;
  buyerDocumentNumber: string;

  passengerName: string;
  passengerDocumentType: string;
  passengerDocumentNumber: string;
  passengerDateOfBirth: Date;

  direction: ReportDirection;
  originIsland: string;
  destinationIsland: string;
  departureDate: Date;
  departureTime: Date;
  ferryName: string;

  checkedIn: boolean;
  checkedInAt: Date | null;

  paymentMethod: string | null;
  paymentStatus: string | null;
  amountPaid: number | null;
  paidAt: Date | null;

  total: number;
  currency: string;
}
