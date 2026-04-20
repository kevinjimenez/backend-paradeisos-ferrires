import { DateUtil } from './../../common/utils/date.util';
import { TicketPdf } from '../interfaces/ticket-pdf.interface';
import { TicketResponse } from '../interfaces/ticket-response.interface';
import { envs } from '../../common/config/envs';

export class TicketMapper {
  static toTicketResponse(ticket: TicketResponse): TicketPdf {
    const outbound = TicketMapper.toTicketOutboundResponse(ticket);

    if (ticket.return_schedules) {
      outbound.returnTrip = TicketMapper.toTicketInboundResponse(ticket);
    }

    return outbound;
  }

  static toTicketOutboundResponse(ticket: TicketResponse): TicketPdf {
    return {
      ticketCode: ticket.ticket_code,
      passengers: ticket.passengers.map((p) => ({
        name: `${p.first_name} ${p.last_name}`,
        code: p.document_number,
        // country: 'USA',
      })),
      checkInTime: DateUtil.formatTime(
        DateUtil.subtractMinutes(
          ticket.outbound_schedules.departure_time,
          envs.checkInTime,
        ),
      ),
      date: DateUtil.formatDate(ticket.outbound_schedules.departure_date),
      departureTime: DateUtil.formatTime(
        ticket.outbound_schedules.departure_time,
      ),
      arriveTime: DateUtil.formatTime(ticket.outbound_schedules.arrival_time),
      ferry: ticket.outbound_schedules.ferries.name,
      from: ticket.outbound_schedules.routes.origin_ports.code,
      origin: ticket.outbound_schedules.routes.origin_ports.name,
      to: ticket.outbound_schedules.routes.destination_ports.code,
      destination: ticket.outbound_schedules.routes.destination_ports.name,
      status: ticket.status,
      generatedAt: new Date().toISOString(),
    };
  }

  static toTicketInboundResponse(ticket: TicketResponse): TicketPdf {
    return {
      ticketCode: ticket.ticket_code,
      passengers: ticket.passengers.map((p) => ({
        name: `${p.first_name} ${p.last_name}`,
        code: p.document_number,
        // country: 'USA',
      })),
      checkInTime: DateUtil.formatTime(
        DateUtil.subtractMinutes(
          ticket.return_schedules!.departure_time,
          envs.checkInTime,
        ),
      ),
      date: DateUtil.formatDate(ticket.return_schedules!.departure_date),
      departureTime: DateUtil.formatTime(
        ticket.return_schedules!.departure_time,
      ),
      arriveTime: DateUtil.formatTime(ticket.return_schedules!.arrival_time),
      ferry: ticket.return_schedules!.ferries.name,
      from: ticket.return_schedules!.routes.origin_ports.code,
      origin: ticket.return_schedules!.routes.origin_ports.name,
      to: ticket.return_schedules!.routes.destination_ports.code,
      destination: ticket.return_schedules!.routes.destination_ports.name,
      status: ticket.status,
      generatedAt: new Date().toISOString(),
    };
  }
}
