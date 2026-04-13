import { Prisma } from 'src/databases/generated/prisma/client';

export class ScheduleSpecifications {
  static byDate(date: string): Prisma.schedulesWhereInput {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return {
      departure_date: {
        gte: startOfDay,
        lt: endOfDay,
      },
    };
  }

  static byOriginPort(portId: string): Prisma.schedulesWhereInput {
    return {
      routes: {
        origin_port_id: portId,
      },
    };
  }

  static byDestinationPort(portId: string): Prisma.schedulesWhereInput {
    return {
      routes: {
        destination_port_id: portId,
      },
    };
  }

  static combine(
    ...specs: Prisma.schedulesWhereInput[]
  ): Prisma.schedulesWhereInput {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.assign({}, ...specs);
  }
}
