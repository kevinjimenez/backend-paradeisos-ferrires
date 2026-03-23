import { ConflictException, HttpStatus } from '@nestjs/common';
import { DomainException } from '../exceptions/domain.exception';
import { ResourceNotFoundException } from '../exceptions/not-found.exception';
import { Prisma } from 'src/databases/generated/prisma/client';

interface PrismaMeta {
  target?: string;
  field_name?: string;
}

const PRISMA_CATALOG = {
  P2002: {
    message: (target: string) => `Field '${target}' already exists`,
    description: 'Unique constraint failed — registro duplicado',
  },
  P2025: {
    message: () => `Record not found`,
    description: 'Record not found — registro no encontrado en la BD',
  },
  P2003: {
    message: (field: string) => `Related record '${field}' not found`,
    description:
      'Foreign key constraint — referencia a un registro que no existe',
  },
  P2014: {
    message: () => `Operation violates a required relation`,
    description: 'Relation violation — viola una relación requerida',
  },
  P2000: {
    message: (target: string) => `Value too long for field '${target}'`,
    description: 'Value too long — el valor supera el tamaño del campo',
  },
} as const;

type PrismaErrorHandler = (meta: PrismaMeta) => never;

const PRISMA_ERROR_MAP: Record<
  string,
  { description: string; exception: PrismaErrorHandler }
> = {
  P2002: {
    description: PRISMA_CATALOG.P2002.description,
    exception: (meta) => {
      throw new ConflictException(
        PRISMA_CATALOG.P2002.message(meta.target ?? 'unknown'),
      );
    },
  },
  P2025: {
    description: PRISMA_CATALOG.P2025.description,
    exception: () => {
      throw new ResourceNotFoundException('Record', 'unknown');
    },
  },
  P2003: {
    description: PRISMA_CATALOG.P2003.description,
    exception: (meta) => {
      throw new DomainException(
        PRISMA_CATALOG.P2003.message(meta.field_name ?? 'unknown'),
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    },
  },
  P2014: {
    description: PRISMA_CATALOG.P2014.description,
    exception: () => {
      throw new DomainException(
        PRISMA_CATALOG.P2014.message(),
        HttpStatus.CONFLICT,
      );
    },
  },
  P2000: {
    description: PRISMA_CATALOG.P2000.description,
    exception: (meta) => {
      throw new DomainException(
        PRISMA_CATALOG.P2000.message(meta.target ?? 'unknown'),
        HttpStatus.BAD_REQUEST,
      );
    },
  },
};

export const handlePrismaError = (error: unknown): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const handler = PRISMA_ERROR_MAP[error.code];
    if (handler) {
      handler.exception(error.meta as PrismaMeta);
    }
  }

  throw error;
};
