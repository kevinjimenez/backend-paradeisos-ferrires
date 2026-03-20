import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsUUID()
  outboundScheduleId: string;

  @IsOptional()
  @IsUUID()
  returnScheduleId?: string;

  @IsNotEmpty()
  @IsNumber()
  totalPassengers: number;
}
