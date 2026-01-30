import { IsOptional, IsUUID } from 'class-validator';

export class CreateSeatHoldsHistoryDto {
  @IsUUID()
  outbound_seat_hold_id: string;

  @IsUUID()
  @IsOptional()
  return_seat_hold_id?: string;
}
