export interface ReportSchedule {
  departure_date: Date;
  departure_time: Date;
  routes: {
    origin_islands: { name: string };
    destination_islands: { name: string };
  };
  ferries: { name: string };
}

export interface ReportContact {
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  document_type: string;
  document_number: string;
}

export interface ReportPassenger {
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  date_of_birth: Date;
  checked_in_outbound: boolean;
  checked_in_return: boolean;
  checked_in_outbound_at: Date | null;
  checked_in_return_at: Date | null;
}

export interface ReportPayment {
  payment_method: string;
  status: string;
  amount: string | number;
  paid_at: Date | null;
}

export interface ReportTicket {
  ticket_code: string;
  status: string;
  trip_type: string;
  total: string | number;
  currency: string;
  created_at: Date;
  contacts: ReportContact | null;
  passengers: ReportPassenger[];
  outbound_schedules: ReportSchedule | null;
  return_schedules: ReportSchedule | null;
  payments: ReportPayment[];
}
