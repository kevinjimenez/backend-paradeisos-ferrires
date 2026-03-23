import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ValidateException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
