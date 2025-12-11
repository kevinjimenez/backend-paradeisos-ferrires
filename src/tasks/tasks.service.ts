import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabasesService } from 'src/databases/databases.service';
import { Prisma, PrismaClient } from 'src/databases/generated/prisma/client';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private databasesService: DatabasesService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // CRON JOB: Ejecutar cada minuto
  // ═══════════════════════════════════════════════════════════════════════════

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredHolds() {
    this.logger.log('🔄 Iniciando liberación de holds expirados...');

    try {
      const result = await this.processExpiredHolds();

      if (result.releasedCount > 0) {
        this.logger.log(
          `✅ Liberados ${result.releasedCount} holds, ` +
            `${result.seatsRestored} asientos restaurados`,
        );
      } else {
        this.logger.debug('No hay holds expirados para liberar');
      }
    } catch (error) {
      this.logger.error('❌ Error liberando holds expirados:', error);
    }
  }

  private async processExpiredHolds() {
    let releasedCount = 0;
    let seatsRestored = 0;

    // 1. Buscar todos los holds expirados
    const expiredHolds = await this.databasesService.seat_holds.findMany({
      where: {
        status: 'held',
        expires_at: {
          lt: new Date(), // menor que ahora = expirado
        },
      },
      include: {
        schedules: true,
      },
    });

    if (expiredHolds.length === 0) {
      return { releasedCount: 0, seatsRestored: 0 };
    }

    this.logger.log(`📋 Encontrados ${expiredHolds.length} holds expirados`);

    // 2. Procesar cada hold en una transacción
    for (const hold of expiredHolds) {
      try {
        await this.releaseHold(hold);
        releasedCount++;
        seatsRestored += hold.quantity;
      } catch (error) {
        this.logger.error(`Error liberando hold ${hold.id}: ${error}`);
      }
    }

    return { releasedCount, seatsRestored };
  }

  private async releaseHold(hold: Prisma.seat_holdsModel) {
    await this.databasesService.$transaction(
      async (
        tx: Omit<
          PrismaClient,
          | '$connect'
          | '$disconnect'
          | '$on'
          | '$transaction'
          | '$use'
          | '$extends'
        >,
      ) => {
        // 1. Marcar hold como expirado
        await tx.seat_holds.update({
          where: { id: hold.id },
          data: {
            status: 'expired',
            released_at: new Date(),
          },
        });

        // 2. Restaurar asientos en el schedule
        await tx.schedules.update({
          where: { id: hold.schedule_id! },
          data: {
            available_seats: {
              increment: hold.quantity,
            },
          },
        });

        this.logger.debug(
          `Hold ${hold.id} liberado: +${hold.quantity} asientos para schedule ${hold.schedule_id}`,
        );
      },
    );
  }
}
