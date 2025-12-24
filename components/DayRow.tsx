
import React from 'react';
import { DayInfo, HearingSlot } from '../types';
import { TIME_SLOTS, EXTRA_POST_KEYS } from '../constants';
import TimeCell from './TimeCell';

interface DayRowProps {
  day: DayInfo;
  isLocked: boolean;
  onToggleLock: () => void;
  data: { [time: string]: HearingSlot };
  slotStatus: { [time: string]: boolean };
  onToggleSlotStatus: (time: string) => void;
  onCellChange: (dateStr: string, time: string, field: keyof HearingSlot, value: string) => void;
  activeTimeSlots: string[];
  showExtraPostSlots: boolean;
  highlightedKey?: string | null;
}

const DayRow: React.FC<DayRowProps> = ({ 
  day, 
  isLocked, 
  onToggleLock, 
  data, 
  slotStatus, 
  onToggleSlotStatus, 
  onCellChange,
  activeTimeSlots,
  showExtraPostSlots,
  highlightedKey
}) => {
  const isWeekendOrHoliday = day.isWeekend || day.isHoliday || day.isRecess || day.isSuspended;
  
  const getRowBg = () => {
    if (day.isRecess) return 'bg-indigo-50 bg-opacity-60';
    if (day.isSuspended) return 'bg-emerald-50 bg-opacity-60';
    if (day.isWeekend) return 'bg-slate-100';
    if (day.isHoliday) return 'bg-amber-50';
    if (isLocked) return 'bg-slate-200 bg-opacity-40';
    return 'bg-white';
  };

  const getDayColor = () => {
    if (day.isRecess) return 'text-indigo-600 font-bold';
    if (day.isSuspended) return 'text-emerald-600 font-bold';
    if (day.isWeekend) return 'text-slate-400';
    if (day.isHoliday) return 'text-amber-600 font-bold';
    if (isLocked) return 'text-slate-500 opacity-60';
    return 'text-slate-900';
  };

  return (
    <div className={`flex border-b border-slate-200 min-w-max hover:bg-slate-50 transition-colors ${getRowBg()}`}>
      {/* Coluna Dia */}
      <div className={`w-8 flex items-center justify-center border-r border-slate-200 py-3 text-[11px] font-bold ${getDayColor()}`}>
        {day.dayNumber}
      </div>
      
      {/* Coluna Semana */}
      <div className={`w-10 flex flex-col items-center justify-center border-r border-slate-200 py-2 relative overflow-hidden ${getDayColor()}`}>
        <span 
          className="text-[9px] uppercase font-bold tracking-tighter whitespace-nowrap select-none"
          style={{ 
            writingMode: 'vertical-lr', 
            transform: 'rotate(180deg)'
          }}
        >
          {day.dayOfWeek}
        </span>
        
        {(day.isHoliday || day.isRecess || day.isSuspended) && (
          <div className="absolute top-1 right-1 flex flex-col items-center">
             {day.isHoliday && <div className="w-1 h-1 rounded-full bg-amber-500 mb-0.5" title={day.holidayName}></div>}
             {day.isRecess && <div className="w-1 h-1 rounded-full bg-indigo-500 mb-0.5" title="Recesso"></div>}
             {day.isSuspended && <div className="w-1 h-1 rounded-full bg-emerald-500" title="Suspensão"></div>}
          </div>
        )}
      </div>

      {/* Coluna Trava */}
      <div className="w-12 flex items-center justify-center border-r border-slate-200">
        {!isWeekendOrHoliday && (
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isLocked}
              onChange={onToggleLock}
            />
            <div className="w-6 h-6 bg-slate-100 border border-slate-300 peer-focus:outline-none rounded-md peer peer-checked:bg-blue-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm">
               {isLocked ? (
                 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
               ) : (
                 <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zM7 7a3 3 0 116 0v2H7V7z" /></svg>
               )}
            </div>
          </label>
        )}
      </div>

      {/* Células de Horário */}
      <div className="flex flex-1 overflow-visible">
        {activeTimeSlots.map((time) => (
          <TimeCell
            key={time}
            time={time}
            value={data[time] || { type: "horário vago", notes: "" }}
            isSet={!!slotStatus[time]}
            onToggleSet={() => onToggleSlotStatus(time)}
            disabled={isLocked || isWeekendOrHoliday}
            isNonWorkingDay={day.isWeekend || day.isHoliday}
            isRecess={day.isRecess}
            isSuspended={day.isSuspended}
            isHighlighted={highlightedKey === `${day.dateStr}-${time}`}
            onChange={(field, val) => onCellChange(day.dateStr, time, field, val)}
          />
        ))}

        {showExtraPostSlots && EXTRA_POST_KEYS.map((key) => (
          <TimeCell
            key={key}
            time={key}
            isExtra={true}
            value={data[key] || { type: "horário vago", notes: "", customTime: "" }}
            isSet={!!slotStatus[key]}
            onToggleSet={() => onToggleSlotStatus(key)}
            disabled={isLocked || isWeekendOrHoliday}
            isNonWorkingDay={day.isWeekend || day.isHoliday}
            isRecess={day.isRecess}
            isSuspended={day.isSuspended}
            isHighlighted={highlightedKey === `${day.dateStr}-${key}`}
            onChange={(field, val) => onCellChange(day.dateStr, key, field, val)}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(DayRow);
