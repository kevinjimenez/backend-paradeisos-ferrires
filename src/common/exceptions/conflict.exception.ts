import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ConflictException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}
