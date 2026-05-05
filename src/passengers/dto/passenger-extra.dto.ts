import { IsInt, IsUUID, Min } from 'class-validator';

export class PassengerExtraDto {
  @IsUUID()
  extraId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}