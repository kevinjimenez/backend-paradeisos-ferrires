export interface TicketPdf {
  ticketCode: string;
  passengers: PassengerPdf[];
  checkinTime: string;
  date: string;
  ferryName: string;
}

export interface PassengerPdf {
  name: string;
  code: string;
  country: string;
}
