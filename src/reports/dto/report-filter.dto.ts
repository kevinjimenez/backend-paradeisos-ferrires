import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import {
  PaymentStatus,
  TicketsStatus,
} from './../../databases/generated/prisma/enums';

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export class ReportFilterDto {
  @IsDateString()
  startDate: string; // 2026-08-01

  @IsDateString()
  endDate: string; // 2026-08-31

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsEnum(TicketsStatus)
  status?: TicketsStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
