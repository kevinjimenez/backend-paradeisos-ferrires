import { Injectable } from '@nestjs/common';
import {
  PdfGenerator,
  PdfGeneratorOptions,
} from './../../common/services/pdf/interfaces/pdf-generator.interface';
import { DateUtil } from './../../common/utils/date.util';
import { REPORT_TEMPLATE_PATH } from '../constants/report.constants';
import { ReportRow } from '../interfaces/report-row.interface';

@Injectable()
export class ReportPdfGenerator implements PdfGenerator<ReportRow[]> {
  getTemplatePath(): string {
    return REPORT_TEMPLATE_PATH;
  }

  prepareData(rows: ReportRow[]) {
    return {
      generatedAt: DateUtil.formatDate(new Date()),
      total: rows.length,
      rows: rows.map((row) => ({
        ...row,
        purchasedAtLabel: DateUtil.formatDate(row.purchasedAt),
        departureDateLabel: DateUtil.formatDate(row.departureDate),
        departureTimeLabel: DateUtil.formatTime(row.departureTime),
        directionLabel: row.direction === 'outbound' ? 'Ida' : 'Vuelta',
        checkedInLabel: row.checkedIn ? 'Sí' : 'No',
      })),
    };
  }

  getPdfOptions(): PdfGeneratorOptions {
    return {
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '8mm', right: '8mm' },
    };
  }
}
