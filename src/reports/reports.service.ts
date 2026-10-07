import { Injectable, NotFoundException } from '@nestjs/common';
import { ValidateException } from './../common/exceptions/validation.exception';
import { PdfService } from './../common/services/pdf/pdf.service';
import { DateUtil } from './../common/utils/date.util';
import { ReportQueryBuilder } from './builders/report-query.builder';
import { MAX_REPORT_RANGE_DAYS } from './constants/report.constants';
import { ReportFilterDto, ReportFormat } from './dto/report-filter.dto';
import { ReportExcelGenerator } from './generators/report-excel.generator';
import { ReportPdfGenerator } from './generators/report-pdf.generator';
import { ReportTicket } from './interfaces/report-ticket.interface';
import { ReportMapper } from './mappers/report.mapper';
import { ReportsRepository } from './reports.repository';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly pdfService: PdfService,
    private readonly reportPdfGenerator: ReportPdfGenerator,
    private readonly reportExcelGenerator: ReportExcelGenerator,
  ) {}

  async generate(filter: ReportFilterDto): Promise<Buffer> {
    const { startDate, endDate } = this.parseDateRange(
      filter.startDate,
      filter.endDate,
    );

    const selectConfig = new ReportQueryBuilder().withAllRelations().build();

    const tickets = await this.reportsRepository.findByDepartureDateRange(
      startDate,
      endDate,
      selectConfig,
      filter.status,
      filter.paymentStatus,
    );

    const rows = ReportMapper.toReportRows(
      tickets as unknown as ReportTicket[],
      startDate,
      endDate,
      filter.paymentStatus,
    );

    if (rows.length === 0) {
      throw new NotFoundException(
        'No se encontraron tickets para las fechas y filtros seleccionados',
      );
    }

    if (filter.format === ReportFormat.EXCEL) {
      return this.reportExcelGenerator.generate(rows);
    }

    return this.pdfService.generate(this.reportPdfGenerator, rows);
  }

  // Interpreta los strings de fecha (ej. "2026-08-01") como días calendario en
  // horario de Galápagos, no como el timezone del proceso donde corre el server.
  private parseDateRange(startDateInput: string, endDateInput: string) {
    const startParts = new Date(startDateInput);
    const endParts = new Date(endDateInput);

    const startDate = DateUtil.toGalapagosInstant(
      startParts.getUTCFullYear(),
      startParts.getUTCMonth(),
      startParts.getUTCDate(),
      0,
      0,
      0,
      0,
    );
    const endDate = DateUtil.toGalapagosInstant(
      endParts.getUTCFullYear(),
      endParts.getUTCMonth(),
      endParts.getUTCDate(),
      23,
      59,
      59,
      999,
    );

    if (startDate > endDate) {
      throw new ValidateException('startDate no puede ser posterior a endDate');
    }

    const rangeDays = (endDate.getTime() - startDate.getTime()) / MS_PER_DAY;
    if (rangeDays > MAX_REPORT_RANGE_DAYS) {
      throw new ValidateException(
        `El rango de fechas no puede superar los ${MAX_REPORT_RANGE_DAYS} días`,
      );
    }

    return { startDate, endDate };
  }
}
