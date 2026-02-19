import { DateUtil } from './../../common/utils/date.util';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { TicketPdf } from '../interfaces/ticket-pdf.interface';
import { TicketResponse } from '../interfaces/ticket-response.interface';
import { envs } from '../../common/config/envs';
import { generateUniqueCode } from '../../common/utils/code-generator.util';

export class TicketMapper {
  static toPrismaCreate(dto: CreateTicketDto, contact: string) {
    const code = generateUniqueCode();
    const totalPassengers = dto.passenger.length;

    const subtotal = dto.passenger.reduce((acc, passengerDto) => {
      return acc + (passengerDto.unitPrice || 0);
    }, 0);
    // falta calcular descuentos
    const taxes = subtotal * envs.taxesValue;
    const total = subtotal + taxes + envs.serviceFeeValue;

    return {
      contacts_id: contact,
      outbound_schedule_id: dto.outboundSchedule,
      return_schedule_id: dto.returnSchedule,
      outbound_hold_id: dto.outboundHold,
      return_hold_id: dto.returnHold,
      trip_type: dto.tripType,
      ticket_code: code,
      subtotal,
      total,
      taxes,
      service_fee: envs.serviceFeeValue,
      discount: envs.discountValue,
      total_passengers: totalPassengers,
      qr_code: code,
    };
  }

  static toTicketResponse(ticket: TicketResponse): TicketPdf {
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
}
