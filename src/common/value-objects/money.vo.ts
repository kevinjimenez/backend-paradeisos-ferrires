import { BadRequestException } from '@nestjs/common';

export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  private constructor(amount: number, currency: string = 'USD') {
    this.validateAmount(amount);
    this.validateCurrency(currency);

    this._amount = this.roundToTwoDecimals(amount);
    this._currency = currency.toUpperCase();
  }

  static create(amount: number, currency: string = 'USD'): Money {
    return new Money(amount, currency);
  }

  static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  static fromCents(cents: number, currency: string = 'USD'): Money {
    return new Money(cents / 100, currency);
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  get cents(): number {
    return Math.round(this._amount * 100);
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount - other._amount, this._currency);
  }

  multiply(factor: number): Money {
    if (!this.isValidNumber(factor)) {
      throw new BadRequestException('Multiplication factor must be a valid number');
    }
    return new Money(this._amount * factor, this._currency);
  }

  divide(divisor: number): Money {
    if (!this.isValidNumber(divisor)) {
      throw new BadRequestException('Divisor must be a valid number');
    }
    if (divisor === 0) {
      throw new BadRequestException('Cannot divide by zero');
    }
    return new Money(this._amount / divisor, this._currency);
  }

  percentage(percent: number): Money {
    if (!this.isValidNumber(percent)) {
      throw new BadRequestException('Percentage must be a valid number');
    }
    return this.multiply(percent / 100);
  }

  isZero(): boolean {
    return this._amount === 0;
  }

  isPositive(): boolean {
    return this._amount > 0;
  }

  isNegative(): boolean {
    return this._amount < 0;
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  greaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amount > other._amount;
  }

  lessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amount < other._amount;
  }

  toString(): string {
    return `${this._currency} ${this._amount.toFixed(2)}`;
  }

  toJSON(): { amount: number; currency: string } {
    return {
      amount: this._amount,
      currency: this._currency,
    };
  }

  private validateAmount(amount: number): void {
    if (!this.isValidNumber(amount)) {
      throw new BadRequestException('Amount must be a valid number');
    }
  }

  private validateCurrency(currency: string): void {
    if (!currency || typeof currency !== 'string' || currency.trim().length !== 3) {
      throw new BadRequestException('Currency must be a valid 3-letter code (e.g., USD, EUR)');
    }
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new BadRequestException(
        `Cannot operate on different currencies: ${this._currency} and ${other._currency}`,
      );
    }
  }

  private isValidNumber(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
