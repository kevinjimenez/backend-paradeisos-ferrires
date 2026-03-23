import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ForbiddenResourceException extends DomainException {
  constructor(
    message: string = 'You do not have permission to access this resource',
  ) {
    super(message, HttpStatus.FORBIDDEN);
  }
}
