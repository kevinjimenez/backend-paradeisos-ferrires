import { Injectable } from '@nestjs/common';
import { envs } from 'src/common/config/envs';
import { generateUniqueCode } from 'src/common/utils/code-generator.util';
import { DateUtil } from 'src/common/utils/date.util';
import { Money, TicketPricing } from 'src/common/value-objects';
import { PassengerInputDto } from 'src/passengers/dto/create-passenger.dto';
import { CreateTicketDto } from '../dto/create-ticket.dto';

type EnrichedTicketDto = Omit<CreateTicketDto, 'passenger'> & {
  passenger: PassengerInputDto[];
};

const CHILD_DISCOUNT_AMOUNT = 10;

@Injectable()
export class TicketFactory {
  createTicketData(dto: EnrichedTicketDto, contactId: string) {
    const code = generateUniqueCode();
    const pricing = this.calculatePricing(dto.passenger);
    const amounts = pricing.toNumbers();

    return {
      contacts_id: contactId,
      outbound_schedule_id: dto.outboundSchedule,
      return_schedule_id: dto.returnSchedule,
      outbound_hold_id: dto.outboundHold,
      return_hold_id: dto.returnHold,
      trip_type: dto.tripType,
      ticket_code: code,
      total_passengers: dto.passenger.length,
      subtotal: amounts.subtotal,
      taxes: amounts.taxes,
      service_fee: amounts.serviceFee,
      discount: amounts.discount,
      total: amounts.total,
      qr_code: code,
    };
  }

  private calculatePricing(passengers: PassengerInputDto[]): TicketPricing {
    const subtotalAmount = passengers.reduce(
      (sum, p) => sum + (p.unitPrice || 0),
      0,
    );
    const childDiscountAmount = passengers.reduce((sum, p) => {
      if (!DateUtil.isEligibleForChildDiscount(p.dateOfBirth)) return sum;
      const legsCount = p.returnFareId ? 2 : 1;
      return sum + CHILD_DISCOUNT_AMOUNT * legsCount;
    }, 0);

    return TicketPricing.calculateFromSubtotal(
      Money.create(subtotalAmount),
      envs.taxesValue,
      Money.create(envs.serviceFeeValue),
      Money.create(envs.discountValue + childDiscountAmount),
    );
  }

  private generateCode(): string {
    return generateUniqueCode();
  }
}
