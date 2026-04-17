export interface DailyQuote {
  chinese: string;
  english: string;
}

export interface CalendarDay {
  date: Date;
  lunarDate: string;
  zodiacYear: string;
  holiday?: {
    chinese: string;
    english: string;
  };
  quote: DailyQuote;
}
