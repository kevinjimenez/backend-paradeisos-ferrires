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

  static isChildUnderFive(
    dateOfBirth: Date | string,
    referenceDate: Date = new Date(),
  ): boolean {
    return DateUtil.getAge(dateOfBirth, referenceDate) < 5;
  }
}
