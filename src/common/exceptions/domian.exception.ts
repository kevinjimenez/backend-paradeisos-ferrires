import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}
