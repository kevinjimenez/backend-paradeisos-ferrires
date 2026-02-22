import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { SeatHoldsHistoryResponse } from './interfaces/seat-holds-history-response';
import { SeatHoldsHistoryRepository } from './seat-holds-history.repository';

@Injectable()
export class SeatHoldsHistoryService {
  private readonly logger = new Logger(SeatHoldsHistoryService.name);

  constructor(
    private readonly seatHoldsHistoryRepository: SeatHoldsHistoryRepository,
  ) {}

  async findOne(id: string): Promise<ApiResponse<SeatHoldsHistoryResponse>> {
    try {
      const seatHoldsHistory =
        await this.seatHoldsHistoryRepository.findOneWithRelations(id);

      if (!seatHoldsHistory) {
        throw new NotFoundException(`Seat holds with ID ${id} not found`);
      }

      if (!seatHoldsHistory.outbound_seat_holds) {
        throw new NotFoundException(`Seat holds expired`);
      }

      return { data: seatHoldsHistory as SeatHoldsHistoryResponse };
    } catch (error) {
      this.logger.error('Error fetching seat holds history', error);
      throw new InternalServerErrorException(
        'Failed to fetch seat holds history',
      );
    }
  }
}
