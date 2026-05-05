/**
 * Форматирует время в формате "X минут/часов назад" с правильными окончаниями
 */
export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "только что";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} ${getMinuteWord(diffMinutes)}`;
  }

  if (diffHours < 24) {
    return `${diffHours} ${getHourWord(diffHours)}`;
  }

  if (diffDays < 7) {
    return `${diffDays} ${getDayWord(diffDays)}`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} ${getWeekWord(diffWeeks)}`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} ${getMonthWord(diffMonths)}`;
  }

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} ${getYearWord(diffYears)}`;
}

/**
 * Возвращает правильное окончание для слова "минута"
 */
function getMinuteWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "минут";
  }

  if (lastDigit === 1) {
    return "минуту";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "минуты";
  }

  return "минут";
}

/**
 * Возвращает правильное окончание для слова "час"
 */
function getHourWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "часов";
  }

  if (lastDigit === 1) {
    return "час";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "часа";
  }

  return "часов";
}

/**
 * Возвращает правильное окончание для слова "день"
 */
function getDayWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "дней";
  }

  if (lastDigit === 1) {
    return "день";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "дня";
  }

  return "дней";
}

/**
 * Возвращает правильное окончание для слова "неделя"
 */
function getWeekWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "недель";
  }

  if (lastDigit === 1) {
    return "неделю";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "недели";
  }

  return "недель";
}

/**
 * Возвращает правильное окончание для слова "месяц"
 */
function getMonthWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "месяцев";
  }

  if (lastDigit === 1) {
    return "месяц";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "месяца";
  }

  return "месяцев";
}

/**
 * Возвращает правильное окончание для слова "год"
 */
function getYearWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "лет";
  }

  if (lastDigit === 1) {
    return "год";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "года";
  }

  return "лет";
}
