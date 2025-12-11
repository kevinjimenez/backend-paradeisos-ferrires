import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  outboundScheduleId: string;

  @IsOptional()
  @IsUUID()
  returnScheduleId?: string;

  @IsNumber()
  totalPassengers: number;

  @IsOptional()
  userId?: string;

  @IsOptional()
  sessionId?: string;
}
