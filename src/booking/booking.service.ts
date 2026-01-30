import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { DatabasesService } from 'src/databases/databases.service';
import { Prisma, PrismaClient } from 'src/databases/generated/prisma/client';

@Injectable()
export class BookingService {
  // Tiempo de expiración del hold (15 minutos)
  private readonly HOLD_EXPIRATION_MINUTES = 15;

  constructor(private databasesService: DatabasesService) {}

  async create(createBookingDto: CreateBookingDto) {
    const { outboundScheduleId, returnScheduleId, totalPassengers } =
      createBookingDto;

    // if (!userId && !sessionId) {
    //   throw new BadRequestException('Se requiere userId o sessionId');
    // }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.HOLD_EXPIRATION_MINUTES);

    return await this.databasesService.$transaction(async (tx) => {
      const outboundHold = await this.createHoldForSchedule(
        tx,
        outboundScheduleId,
        totalPassengers,
        expiresAt,
      );

      const returnHold = returnScheduleId
        ? await this.createHoldForSchedule(
            tx,
            returnScheduleId,
            totalPassengers,
            expiresAt,
          )
        : null;

      const { id } = await tx.seat_holds_history.create({
        data: {
          outbound_seat_hold_id: outboundHold.id,
          return_seat_hold_id: returnHold?.id,
        },
      });

      return {
        seatHoldsHistory: id,
      };
    });

    // return 'This action adds a new booking';
  }

  private async createHoldForSchedule(
    tx: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    scheduleId: string,
    quantity: number,
    expiresAt: Date,
  ) {
    // 1. Obtener schedule CON LOCK para evitar race conditions
    //    Usamos "FOR UPDATE" mediante una raw query
    const schedules: Prisma.schedulesModel[] = await tx.$queryRaw`
      SELECT id, available_seats, total_capacity, status
      FROM schedules
      WHERE id = ${scheduleId}
      FOR UPDATE
    `;
    const schedule = schedules[0];

    if (!schedule) {
      throw new BadRequestException(`Viaje ${scheduleId} no encontrado`);
    }

    if (schedule.status !== 'scheduled') {
      throw new BadRequestException(
        `Viaje no disponible (estado: ${schedule.status})`,
      );
    }

    if (schedule.available_seats < quantity) {
      throw new BadRequestException(
        `No hay suficientes asientos. Disponibles: ${schedule.available_seats}, Solicitados: ${quantity}`,
      );
    }

    const seatHold = await tx.seat_holds.create({
      select: {
        id: true,
      },
      data: {
        schedule_id: scheduleId,
        quantity,
        expires_at: expiresAt,
      },
    });

    // 3. Decrementar asientos disponibles
    await tx.schedules.update({
      where: { id: scheduleId },
      data: {
        available_seats: {
          decrement: quantity,
        },
      },
    });

    return seatHold;

    // if (!schedule) {
    //   throw new BadRequestException(`Viaje ${scheduleId} no encontrado`);
    // }
    // if (schedule.status !== 'scheduled') {
    //   throw new BadRequestException(
    //     `Viaje no disponible (estado: ${schedule.status})`,
    //   );
    // }
    // if (schedule.available_seats < quantity) {
    //   throw new BadRequestException(
    //     `No hay suficientes asientos. Disponibles: ${schedule.available_seats}, Solicitados: ${quantity}`,
    //   );
    // }
    // // 2. Crear el seat_hold
    // const seatHold = await tx.seatHold.create({
    //   data: {
    //     scheduleId,
    //     userId: userId || null,
    //     sessionId: sessionId || null,
    //     quantity,
    //     status: 'held',
    //     heldAt: new Date(),
    //     expiresAt,
    //   },
    // });
    // // 3. Decrementar asientos disponibles
    // await tx.schedule.update({
    //   where: { id: scheduleId },
    //   data: {
    //     availableSeats: {
    //       decrement: quantity,
    //     },
    //   },
    // });
    // // 4. Retornar el hold con info del schedule
    // return {
    //   ...seatHold,
    //   schedule: {
    //     id: schedule.id,
    //     remainingSeats: schedule.available_seats - quantity,
    //   },
    // };
  }
}
