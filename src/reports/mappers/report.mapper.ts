import {
  ReportPassenger,
  ReportSchedule,
  ReportTicket,
} from '../interfaces/report-ticket.interface';
import { ReportDirection, ReportRow } from '../interfaces/report-row.interface';

interface Leg {
  direction: ReportDirection;
  schedule: ReportSchedule | null;
  checkedInKey: 'checked_in_outbound' | 'checked_in_return';
  checkedInAtKey: 'checked_in_outbound_at' | 'checked_in_return_at';
}

export class ReportMapper {
  // Cada fila representa un pasajero en un tramo (ida o vuelta) cuya fecha de
  // salida cae dentro del rango solicitado, no la fecha de compra del ticket.
  static toReportRows(
    tickets: ReportTicket[],
    startDate: Date,
    endDate: Date,
    paymentStatus?: string,
  ): ReportRow[] {
    const rows: ReportRow[] = [];

    for (const ticket of tickets) {
      // Si se filtró por estado de pago, se muestra ese pago en la fila (puede
      // haber varios intentos por ticket); si no, el más reciente.
      const payment = paymentStatus
        ? ticket.payments.find((p) => p.status === paymentStatus)
        : ticket.payments[0];
      const buyerName = `${ticket.contacts?.first_name ?? ''} ${
        ticket.contacts?.last_name ?? ''
      }`.trim();

      const legs: Leg[] = [
        {
          direction: 'outbound',
          schedule: ticket.outbound_schedules,
          checkedInKey: 'checked_in_outbound',
          checkedInAtKey: 'checked_in_outbound_at',
        },
        {
          direction: 'return',
          schedule: ticket.return_schedules,
          checkedInKey: 'checked_in_return',
          checkedInAtKey: 'checked_in_return_at',
        },
      ];

      for (const leg of legs) {
        if (!leg.schedule) continue;

        const departureDate = new Date(leg.schedule.departure_date);
        if (departureDate < startDate || departureDate > endDate) continue;

        for (const passenger of ticket.passengers) {
          rows.push(
            ReportMapper.toRow(ticket, passenger, leg, payment, buyerName),
          );
        }
      }
    }

    return rows;
  }

  private static toRow(
    ticket: ReportTicket,
    passenger: ReportPassenger,
    leg: Leg,
    payment: ReportTicket['payments'][number] | undefined,
    buyerName: string,
  ): ReportRow {
    const schedule = leg.schedule as ReportSchedule;

    return {
      ticketCode: ticket.ticket_code,
      ticketStatus: ticket.status,
      tripType: ticket.trip_type,
      purchasedAt: ticket.created_at,

      buyerName,
      buyerEmail: ticket.contacts?.email ?? '',
      buyerPhone: ticket.contacts?.phone ?? null,
      buyerDocumentType: ticket.contacts?.document_type ?? '',
      buyerDocumentNumber: ticket.contacts?.document_number ?? '',

      passengerName: `${passenger.first_name} ${passenger.last_name}`,
      passengerDocumentType: passenger.document_type,
      passengerDocumentNumber: passenger.document_number,
      passengerDateOfBirth: passenger.date_of_birth,

      direction: leg.direction,
      originIsland: schedule.routes.origin_islands.name,
      destinationIsland: schedule.routes.destination_islands.name,
      departureDate: schedule.departure_date,
      departureTime: schedule.departure_time,
      ferryName: schedule.ferries.name,

      checkedIn: passenger[leg.checkedInKey],
      checkedInAt: passenger[leg.checkedInAtKey],

      paymentMethod: payment?.payment_method ?? null,
      paymentStatus: payment?.status ?? null,
      amountPaid: payment ? Number(payment.amount) : null,
      paidAt: payment?.paid_at ?? null,

      total: Number(ticket.total),
      currency: ticket.currency,
    };
  }
}
