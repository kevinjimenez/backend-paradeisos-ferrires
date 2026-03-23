import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domian.exception';

export class ConflictException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}
