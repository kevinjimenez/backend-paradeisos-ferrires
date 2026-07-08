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

  static byOriginIsland(islandId: string): Prisma.schedulesWhereInput {
    return {
      routes: {
        origin_island_id: islandId,
      },
    };
  }

  static byDestinationIsland(islandId: string): Prisma.schedulesWhereInput {
    return {
      routes: {
        destination_island_id: islandId,
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
