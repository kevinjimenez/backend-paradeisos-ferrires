import { Controller, Get, Query, Res } from '@nestjs/common';
import express from 'express';
import {
  HTTP_CONTENT_TYPES,
  HTTP_HEADERS,
} from 'src/common/constants/http.constants';
import { SkipTransform } from 'src/common/decorators/skip-transform.decorator';
import {
  REPORT_EXCEL_FILENAME,
  REPORT_PDF_FILENAME,
} from './constants/report.constants';
import { ReportFilterDto, ReportFormat } from './dto/report-filter.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @SkipTransform()
  @Get('tickets')
  async getTicketsReport(
    @Query() filter: ReportFilterDto,
    @Res() res: express.Response,
  ) {
    const report = await this.reportsService.generate(filter);

    const isExcel = filter.format === ReportFormat.EXCEL;

    res.set({
      'Content-Type': isExcel
        ? HTTP_CONTENT_TYPES.EXCEL
        : HTTP_CONTENT_TYPES.PDF,
      'Content-Disposition': HTTP_HEADERS.contentDisposition(
        isExcel ? REPORT_EXCEL_FILENAME : REPORT_PDF_FILENAME,
      ),
    });
    res.send(report);
  }
}
