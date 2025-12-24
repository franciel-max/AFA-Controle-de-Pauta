
export interface HearingSlot {
  type: string;
  notes: string;
  customTime?: string; // Novo campo para horários extras manuais
}

export interface HearingData {
  [key: string]: HearingSlot; // Key format: "YYYY-MM-DD-HH:mm" ou "YYYY-MM-DD-extra1"
}

export interface DayInfo {
  date: Date;
  dayNumber: number;
  dayOfWeek: string;
  isWeekend: boolean;
  isHoliday: boolean;
  isRecess?: boolean;
  isSuspended?: boolean;
  holidayName?: string;
  dateStr: string;
}

export interface MonthInfo {
  name: string;
  monthIndex: number;
  year: number;
  days: DayInfo[];
}
