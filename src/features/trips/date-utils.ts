const DAY_MS = 86400000;
export const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
export const dateCount = (start: string, end: string): number => {
  if (!isValidDate(start) || !isValidDate(end) || start > end)
    return 0;
  return Math.round((Date.parse(end) - Date.parse(start)) / DAY_MS) + 1;
};
export const addDays = (date: string, amount: number): string => {
  if (!isValidDate(date) || !Number.isInteger(amount))
    throw new Error('날짜가 올바르지 않습니다.');
  return new Date(Date.parse(date) + amount * DAY_MS).toISOString().slice(0, 10);
};
export const dateRange = (start: string, end: string): string[] => Array.from({ length: dateCount(start, end) }, (_, index) => addDays(start, index));
export const formatDate = (value: string): string => {
  if (!isValidDate(value))
    return value;
  const date = new Date(`${value}T00:00:00Z`);
  return `${date.getUTCMonth() + 1}월 ${date.getUTCDate()}일`;
};
export const localToday = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
