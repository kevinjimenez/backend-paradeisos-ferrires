import { PrismaClient } from './generated/prisma/client';

/**
 * Tipo para el cliente Prisma dentro de transacciones interactivas.
 * Omite métodos no disponibles en contexto transaccional.
 *
 * @example
 * async function updateWithTransaction(tx: PrismaTransaction) {
 *   await tx.users.update({ ... });
 * }
 */
export type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
