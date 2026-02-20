export interface TicketPdf {
  ticketCode: string;
  passengers: PassengerPdf[];
  checkInTime: string;
  date: string;
  departureTime: string;
  arriveTime: string;
  ferry: string;
  from: string;
  origin: string;
  to: string;
  destination: string;
  status?: string;
  generatedAt?: string;
}

export interface PassengerPdf {
  name: string;
  code: string;
  // country: string;
}
