export interface CreateTicketResponse {
  id: string;
  contact: string;
  passengers: string[];
  total?: number;
  subtotal?: number;
  taxes?: number;
  serviceFee?: number;
  discount?: number;
}
