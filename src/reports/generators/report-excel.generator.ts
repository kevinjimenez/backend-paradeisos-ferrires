import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { DateUtil } from './../../common/utils/date.util';
import { ReportRow } from '../interfaces/report-row.interface';

@Injectable()
export class ReportExcelGenerator {
  async generate(rows: ReportRow[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tickets');

    sheet.columns = [
      { header: 'Código ticket', key: 'ticketCode', width: 16 },
      { header: 'Estado ticket', key: 'ticketStatus', width: 14 },
      { header: 'Tipo de viaje', key: 'tripType', width: 14 },
      { header: 'Fecha de compra', key: 'purchasedAt', width: 18 },
      { header: 'Comprador', key: 'buyerName', width: 26 },
      { header: 'Email comprador', key: 'buyerEmail', width: 28 },
      { header: 'Teléfono comprador', key: 'buyerPhone', width: 16 },
      { header: 'Documento comprador', key: 'buyerDocumentNumber', width: 20 },
      { header: 'Pasajero', key: 'passengerName', width: 26 },
      {
        header: 'Documento pasajero',
        key: 'passengerDocumentNumber',
        width: 20,
      },
      { header: 'Fecha nacimiento', key: 'passengerDateOfBirth', width: 16 },
      { header: 'Trayecto', key: 'direction', width: 10 },
      { header: 'Origen', key: 'originIsland', width: 18 },
      { header: 'Destino', key: 'destinationIsland', width: 18 },
      { header: 'Fecha salida', key: 'departureDate', width: 14 },
      { header: 'Hora salida', key: 'departureTime', width: 12 },
      { header: 'Ferry', key: 'ferryName', width: 18 },
      { header: 'Check-in', key: 'checkedIn', width: 10 },
      { header: 'Fecha check-in', key: 'checkedInAt', width: 18 },
      { header: 'Método de pago', key: 'paymentMethod', width: 16 },
      { header: 'Estado de pago', key: 'paymentStatus', width: 14 },
      { header: 'Monto pagado', key: 'amountPaid', width: 14 },
      { header: 'Fecha de pago', key: 'paidAt', width: 18 },
      { header: 'Total ticket', key: 'total', width: 12 },
      { header: 'Moneda', key: 'currency', width: 10 },
    ];

    sheet.getRow(1).font = { bold: true };

    rows.forEach((row) => {
      sheet.addRow({
        ...row,
        purchasedAt: DateUtil.formatDate(row.purchasedAt),
        passengerDateOfBirth: DateUtil.formatDate(row.passengerDateOfBirth),
        direction: row.direction === 'outbound' ? 'Ida' : 'Vuelta',
        departureDate: DateUtil.formatDate(row.departureDate),
        departureTime: DateUtil.formatTime(row.departureTime),
        checkedIn: row.checkedIn ? 'Sí' : 'No',
        checkedInAt: row.checkedInAt
          ? DateUtil.formatDate(row.checkedInAt)
          : '',
        paidAt: row.paidAt ? DateUtil.formatDate(row.paidAt) : '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
