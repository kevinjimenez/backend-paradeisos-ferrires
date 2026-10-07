export interface TicketResponse {
  id: string;
  status: string;
  ticket_code: string;
  qr_code: null | string;
  passengers: Passenger[];
  outbound_schedules: Schedules;
  return_schedules?: Schedules;
}

export interface Schedules {
  departure_date: Date;
  departure_time: Date;
  arrival_time: Date;
  routes: Routes;
  ferries: Ferries;
}

export interface Ferries {
  name: string;
}

export interface Routes {
  origin_islands: Islands;
  destination_islands: Islands;
}

export interface Islands {
  name: string;
  code: string;
}

export interface Passenger {
  first_name: string;
  last_name: string;
  country: string | null;
  document_number: string;
  date_of_birth: Date;
}
