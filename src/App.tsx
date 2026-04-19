/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  FileText, 
  LayoutGrid, 
  User,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Solar, Lunar } from 'lunar-javascript';
import { QUOTES, NUMBER_WORDS, MONTH_NAMES_CN, WEEKDAYS_CN } from './constants';
import { CalendarDay } from './types';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeStyle, setTimeStyle] = useState<'style1' | 'style2'>('style2');
  const [view, setView] = useState<'daily' | 'month' | 'agenda' | 'profile'>('daily');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check if it's a new day compared to currentDate
      if (
        now.getDate() !== currentDate.getDate() || 
        now.getMonth() !== currentDate.getMonth() || 
        now.getFullYear() !== currentDate.getFullYear()
      ) {
        setCurrentDate(now);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentDate]);

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Real lunar date calculation using lunar-javascript
  const getLunarInfo = (date: Date) => {
    const solar = Solar.fromDate(date);
    const lunar = Lunar.fromSolar(solar);
    return {
      lunarDate: `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      zodiacYear: `${lunar.getYearInGanZhi()}年 ${lunar.getYearShengXiao()}`
    };
  };

  const getDailyQuoteIndex = (date: Date) => {
    // Create a unique string for the day (YYYY-MM-DD)
    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    // Simple hash function to get a consistent index for the same date
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % QUOTES.length;
  };

  const getDayData = (date: Date): CalendarDay => {
    const { lunarDate, zodiacYear } = getLunarInfo(date);
    const solar = Solar.fromDate(date);
    const lunar = Lunar.fromSolar(solar);
    
    // Get holidays from both solar and lunar calendars
    const solarFestivals = solar.getFestivals();
    const lunarFestivals = lunar.getFestivals();
    const otherFestivals = solar.getOtherFestivals();
    
    let holiday;
    const allFestivals = [...solarFestivals, ...lunarFestivals, ...otherFestivals];
    
    if (allFestivals.length > 0) {
      // For simplicity, take the first one found
      holiday = { chinese: allFestivals[0], english: "" };
    }

    return {
      date,
      lunarDate,
      zodiacYear,
      holiday,
      quote: QUOTES[getDailyQuoteIndex(date)]
    };
  };

  const dayData = getDayData(currentDate);
  const monthName = MONTH_NAMES_CN[currentDate.getMonth()];
  const weekdayName = WEEKDAYS_CN[currentDate.getDay()];
  const englishWeekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = `${currentDate.getFullYear()}年${String(currentDate.getMonth() + 1).padStart(2, '0')}月${currentDate.getDate()}日`;

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  return (
    <div className="h-screen bg-background flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed overflow-hidden">
      {/* Top Navigation */}
      <nav className="bg-background flex justify-between items-center w-full px-6 h-16 fixed top-0 z-50">
        <div className="flex items-center space-x-4">
          <button className="text-primary p-2 shadow-none outline-none">
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
        <h1 className="font-headline tracking-widest uppercase text-xl font-bold text-primary">
          {monthName}
        </h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setTimeStyle(prev => prev === 'style1' ? 'style2' : 'style1')}
            className="text-primary p-2 flex items-center gap-2 shadow-none outline-none"
            title="切换时间样式"
          >
            {timeStyle === 'style1' ? (
              <ToggleLeft size={32} strokeWidth={1.5} />
            ) : (
              <ToggleRight size={32} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-16 landscape:pt-16 lg:pt-20 pb-0 px-4 flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full max-w-[1024px] mx-auto flex flex-col landscape:flex-row lg:flex-row landscape:items-stretch lg:items-stretch landscape:gap-8 lg:gap-12 h-full max-h-[720px] landscape:max-h-[90vh]">
          
          {/* Left Column: Date Info */}
          <header className="w-full max-w-[340px] mx-auto landscape:mx-0 lg:mx-0 landscape:max-w-[220px] lg:max-w-[240px] grid grid-cols-2 landscape:grid-cols-1 lg:grid-cols-1 gap-4 pt-4 pb-2 landscape:py-6 lg:py-12 landscape:border-r lg:border-r landscape:border-outline-variant lg:border-outline-variant landscape:pr-6 lg:pr-8 flex-shrink-0">
            <div className="flex flex-col">
              <span className="text-tertiary font-headline font-bold text-lg landscape:text-2xl lg:text-2xl leading-tight">
                {formattedDate}
              </span>
              <span className="text-tertiary font-body font-medium text-lg landscape:text-xl lg:text-xl leading-tight">
                {weekdayName}
              </span>
            </div>
            <div className="flex flex-col items-end landscape:items-start lg:items-start border-l landscape:border-l-0 lg:border-l-0 border-outline-variant pl-4 landscape:pl-0 lg:pl-0 landscape:mt-6 lg:mt-6">
              <span className="text-on-surface-variant font-body text-sm landscape:text-base lg:text-base">
                {dayData.lunarDate}
              </span>
              <span className="text-on-surface-variant font-body text-sm landscape:text-base lg:text-base mt-1">
                {dayData.zodiacYear}
              </span>
              <div className="hidden landscape:block mt-4 pt-4 border-t border-outline-variant">
                <p className="font-body text-on-surface text-sm lg:text-base font-medium leading-relaxed italic">
                  {dayData.quote.chinese}
                </p>
              </div>
            </div>
          </header>

          {/* Right Column: Main Calendar Box */}
          <section className="w-full max-w-[340px] landscape:max-w-none lg:max-w-none landscape:flex-1 lg:flex-1 mx-auto main-calendar-box bg-surface-container-lowest flex flex-col items-center flex-grow mb-4 landscape:mb-2 relative overflow-hidden">
            {/* Navigation Arrows (Hidden in original image but useful for app) */}
            <button 
              onClick={() => changeDate(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors p-2 hidden lg:block"
            >
              <ChevronLeft size={32} strokeWidth={1} />
            </button>
            <button 
              onClick={() => changeDate(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors p-2 hidden lg:block"
            >
              <ChevronRight size={32} strokeWidth={1} />
            </button>

            <AnimatePresence mode="wait">
              <motion.div 
                key={currentDate.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full flex flex-col items-center h-full"
              >
                {/* Box Header */}
                <div className="pt-6 landscape:pt-2 lg:pt-10 text-center min-h-[80px] landscape:min-h-[40px]">
                  {dayData.holiday ? (
                    <>
                      <p className="font-body text-secondary text-sm lg:text-base tracking-tight">
                        {dayData.holiday.english}
                      </p>
                      <h3 className="font-headline font-bold text-2xl lg:text-4xl text-on-surface">
                        {dayData.holiday.chinese}
                      </h3>
                    </>
                  ) : (
                    <h3 className="font-headline font-bold text-2xl lg:text-4xl text-on-surface">
                      日期
                    </h3>
                  )}
                </div>

                {/* Center Display Number */}
                <div className="flex flex-col items-center justify-center flex-grow py-8 landscape:py-2 lg:py-24">
                  <h2 className="font-headline font-extrabold text-[12rem] landscape:text-[8rem] leading-[0.8] text-primary/80 hero-date-text">
                    {currentDate.getDate()}
                  </h2>
                  <p className={`font-bold tracking-tight text-primary/60 mt-[30px] pl-[1px] text-center ${
                    timeStyle === 'style1' 
                      ? 'font-headline text-7xl landscape:text-5xl lg:text-9xl' 
                      : 'font-clock-style-2 text-7xl landscape:text-6xl lg:text-8xl'
                  }`}>
                    {formatTime(currentTime)}
                  </p>
                </div>

                {/* Bottom Section Inside Box */}
                <footer className="w-full mt-auto landscape:hidden">
                  <div className="w-full h-[1px] bg-outline-variant"></div>
                  <div className="pt-8 pb-12 lg:pt-12 lg:pb-20 px-6 lg:px-10 flex flex-col items-center justify-center text-center">
                    <div className="space-y-2 w-full max-w-2xl relative -top-[0.5em]">
                      <p className="font-body text-on-surface text-xl lg:text-3xl font-medium leading-relaxed">
                        {dayData.quote.chinese}
                      </p>
                    </div>
                  </div>
                </footer>
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all duration-300 ${
        active ? 'text-primary' : 'text-secondary opacity-50 hover:opacity-100'
      }`}
    >
      <span className="mb-1">{icon}</span>
      <span className="font-headline text-[10px] tracking-tighter font-bold">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="w-1 h-1 bg-primary mt-1 rounded-full"
        />
      )}
    </button>
  );
}
