export interface ScheduleTemplateResponse {
  id: string;
  route_id: string;
  ferry_id: string;
  departure_hour: number;
  departure_minute: number;
  is_active: boolean;
  notes: string | null;
}

export interface ActiveScheduleTemplate extends ScheduleTemplateResponse {
  routes: {
    duration_minutes: number;
  };
  ferries: {
    capacity: number;
  };
}
