export class DateUtil {
  static formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static subtractMinutes(date: Date, minutes: number): Date {
    // 60_000 ==> 60000
    return new Date(new Date(date).getTime() - minutes * 60_000);
  }

  static formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  }
}
