import { Money } from './money.vo';

export interface TicketPricingProps {
  subtotal: Money;
  taxes: Money;
  serviceFee: Money;
  discount: Money;
}

export class TicketPricing {
  private readonly _subtotal: Money;
  private readonly _taxes: Money;
  private readonly _serviceFee: Money;
  private readonly _discount: Money;
  private readonly _total: Money;

  private constructor(props: TicketPricingProps) {
    this._subtotal = props.subtotal;
    this._taxes = props.taxes;
    this._serviceFee = props.serviceFee;
    this._discount = props.discount;
    this._total = this.calculateTotal();
  }

  static create(props: TicketPricingProps): TicketPricing {
    return new TicketPricing(props);
  }

  static calculateFromSubtotal(
    subtotal: Money,
    taxRate: number,
    serviceFee: Money,
    discount: Money = Money.zero(subtotal.currency),
  ): TicketPricing {
    const taxes = subtotal.percentage(taxRate * 100);

    return new TicketPricing({
      subtotal,
      taxes,
      serviceFee,
      discount,
    });
  }

  get subtotal(): Money {
    return this._subtotal;
  }

  get taxes(): Money {
    return this._taxes;
  }

  get serviceFee(): Money {
    return this._serviceFee;
  }

  get discount(): Money {
    return this._discount;
  }

  get total(): Money {
    return this._total;
  }

  applyDiscount(discount: Money): TicketPricing {
    return new TicketPricing({
      subtotal: this._subtotal,
      taxes: this._taxes,
      serviceFee: this._serviceFee,
      discount,
    });
  }

  toJSON() {
    return {
      subtotal: this._subtotal.amount,
      taxes: this._taxes.amount,
      serviceFee: this._serviceFee.amount,
      discount: this._discount.amount,
      total: this._total.amount,
    };
  }

  toNumbers() {
    return {
      subtotal: this._subtotal.amount,
      taxes: this._taxes.amount,
      serviceFee: this._serviceFee.amount,
      discount: this._discount.amount,
      total: this._total.amount,
    };
  }

  private calculateTotal(): Money {
    return this._subtotal
      .add(this._taxes)
      .add(this._serviceFee)
      .subtract(this._discount);
  }
}
