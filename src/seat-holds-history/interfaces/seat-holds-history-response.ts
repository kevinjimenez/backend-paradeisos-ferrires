import {
  FerriesSchedule,
  RoutesSchedule,
} from 'src/schedules/interfaces/schedule-response.interface';

export interface SeatHoldsHistoryResponse {
  id: string;
  outbound_seat_hold_id: string;
  return_seat_hold_id: string | null;
  created_at: Date;
  outbound_seat_holds: SeatHolds | null;
  return_seat_holds: SeatHolds | null;
}

export interface SeatHolds {
  status: string;
  schedules: SchedulesSeatHold | null;
}

export interface SchedulesSeatHold {
  arrival_time: Date;
  departure_time: Date;
  ferries: FerriesSeatHold | null;
  routes: RoutesSeatHold | null;
}

export interface FerriesSeatHold extends FerriesSchedule {
  name: string;
  register_code: string;
}

export interface RoutesSeatHold extends RoutesSchedule {}
