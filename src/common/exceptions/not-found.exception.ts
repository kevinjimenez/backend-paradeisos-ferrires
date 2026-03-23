import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domian.exception';

export class ResourceNotFoundException extends DomainException {
  constructor(resource: string, id: string | number) {
    super(`${resource} with id '${id}' not found`, HttpStatus.NOT_FOUND);
  }
}
