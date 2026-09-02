import { Module } from '@nestjs/common';
import { ReportExcelGenerator } from './generators/report-excel.generator';
import { ReportPdfGenerator } from './generators/report-pdf.generator';
import { ReportsController } from './reports.controller';
import { ReportsRepository } from './reports.repository';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsRepository,
    ReportPdfGenerator,
    ReportExcelGenerator,
  ],
})
export class ReportsModule {}
