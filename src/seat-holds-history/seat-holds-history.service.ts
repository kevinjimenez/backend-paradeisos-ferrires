import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DomainException } from 'src/common/exceptions/domain.exception';
import { ResourceNotFoundException } from 'src/common/exceptions/not-found.exception';
import { handleServiceError } from 'src/common/utils/service-error.handler';
import { SeatHoldsHistoryResponse } from './interfaces/seat-holds-history-response';
import { SeatHoldsHistoryRepository } from './seat-holds-history.repository';

@Injectable()
export class SeatHoldsHistoryService {
  private readonly logger = new Logger(SeatHoldsHistoryService.name);

  constructor(
    private readonly seatHoldsHistoryRepository: SeatHoldsHistoryRepository,
  ) {}

  async findOne(id: string): Promise<SeatHoldsHistoryResponse> {
    try {
      const seatHoldsHistory =
        await this.seatHoldsHistoryRepository.findOneWithRelations(id);

      if (!seatHoldsHistory) {
        throw new ResourceNotFoundException('Seat holds', id);
      }

      if (!seatHoldsHistory.outbound_seat_holds) {
        throw new DomainException('Seat hold expired', HttpStatus.NOT_FOUND);
      }

      return seatHoldsHistory as SeatHoldsHistoryResponse;
    } catch (error) {
      return handleServiceError(
        error,
        this.logger,
        'Failed to fetch seat holds history',
      );
    }
  }
}
