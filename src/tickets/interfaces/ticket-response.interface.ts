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
  origin_ports: Ports;
  destination_ports: Ports;
}

export interface Ports {
  name: string;
  islands: Ferries;
}

export interface Passenger {
  first_name: string;
  last_name: string;
  document_number: string;
}
