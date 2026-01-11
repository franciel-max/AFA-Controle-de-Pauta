
import React, { useState } from 'react';
import { MONTHS_PT, DAYS_PT, getHolidays } from '../constants';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  currentYear: number;
  currentMonth: number;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, onSelectDate, currentYear, currentMonth }) => {
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);

  if (!isOpen) return null;

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const holidays = getHolidays(viewYear);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(v => v - 1);
    } else {
      setViewMonth(v => v - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(v => v + 1);
    } else {
      setViewMonth(v => v + 1);
    }
  };

  const today = new Date();
  today.setHours(0,0,0,0);

  const days = [];
  // Espaços vazios para o início do mês
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-12 w-full"></div>);
  }

  // Dias do mês
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isHoliday = !!holidays[dateStr];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isToday = date.getTime() === today.getTime();

    days.push(
      <button
        key={d}
        onClick={() => onSelectDate(date)}
        className={`h-12 w-full flex flex-col items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95 border
          ${isToday ? 'bg-blue-600 text-white border-blue-400 shadow-lg z-10 font-bold' : 
            isHoliday ? 'bg-amber-100 text-amber-700 border-amber-200' :
            isWeekend ? 'bg-slate-50 text-slate-400 border-slate-100' : 
            'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'}`}
      >
        <span className="text-sm">{d}</span>
        {isHoliday && <div className="w-1 h-1 bg-amber-500 rounded-full mt-0.5"></div>}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Navegar Pauta</span>
            <div className="flex items-center space-x-2">
               <span className="text-xl font-black uppercase tracking-tight">{MONTHS_PT[viewMonth]}</span>
               <span className="text-xl font-light text-slate-500">{viewYear}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
              <div key={idx} className="text-center text-[10px] font-black text-slate-400 uppercase">{day}</div>
            ))}
            {days}
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl transition-colors"
          >
            Fechar Calendário
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
