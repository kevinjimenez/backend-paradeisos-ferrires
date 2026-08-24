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
    const parts = new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }).formatToParts(new Date(date));

    const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';
    const day = parts.find((p) => p.type === 'day')?.value ?? '';
    const month = parts.find((p) => p.type === 'month')?.value ?? '';
    const year = new Date(date).getFullYear();
    const capitalizedWeekday =
      weekday.charAt(0).toUpperCase() + weekday.slice(1);

    return `${capitalizedWeekday}, ${day}.${month}.${year}`;
  }

  static getAge(
    dateOfBirth: Date | string,
    referenceDate: Date = new Date(),
  ): number {
    const birthDate = new Date(dateOfBirth);
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear =
      referenceDate.getMonth() > birthDate.getMonth() ||
      (referenceDate.getMonth() === birthDate.getMonth() &&
        referenceDate.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) age -= 1;

    return age;
  }

  static isEligibleForChildDiscount(
    dateOfBirth: Date | string,
    referenceDate: Date = new Date(),
  ): boolean {
    return DateUtil.getAge(dateOfBirth, referenceDate) <= 5;
  }
}
