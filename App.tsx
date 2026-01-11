
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HearingData, DayInfo, MonthInfo, HearingSlot } from './types';
import { TIME_SLOTS, EXTRA_POST_KEYS, MONTHS_PT, DAYS_PT, getHolidays } from './constants';
import DayRow from './components/DayRow';
import JusticeAILogo from './components/JusticeAILogo';
import CalendarModal from './components/CalendarModal';

const App: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [todayDate, setTodayDate] = useState(new Date());
  
  // Estados de visualização
  const [showEarlySlots, setShowEarlySlots] = useState(false);
  const [showHiddenFridays, setShowHiddenFridays] = useState(false);
  const [showExtraPostSlots, setShowExtraPostSlots] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Estados de busca
  const [searchDayOfWeek, setSearchDayOfWeek] = useState<string>("");
  const [searchTime, setSearchTime] = useState<string>("");
  const [lastFoundKey, setLastFoundKey] = useState<string | null>(null);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);

  const mainScrollRef = useRef<HTMLDivElement>(null);

  const [hearingData, setHearingData] = useState<HearingData>(() => {
    const saved = localStorage.getItem('legal_agenda_data_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [lockedDays, setLockedDays] = useState<{ [dateStr: string]: boolean }>(() => {
    const saved = localStorage.getItem('legal_agenda_locked');
    return saved ? JSON.parse(saved) : {};
  });

  const [slotStatus, setSlotStatus] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('legal_agenda_slots');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== todayDate.getDate()) {
        setTodayDate(now);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [todayDate]);

  useEffect(() => {
    localStorage.setItem('legal_agenda_data_v2', JSON.stringify(hearingData));
  }, [hearingData]);

  useEffect(() => {
    localStorage.setItem('legal_agenda_locked', JSON.stringify(lockedDays));
  }, [lockedDays]);

  useEffect(() => {
    localStorage.setItem('legal_agenda_slots', JSON.stringify(slotStatus));
  }, [slotStatus]);

  const clearHighlight = useCallback(() => {
    setHighlightedKey(null);
  }, []);

  const toggleDayLock = useCallback((dateStr: string) => {
    setLockedDays(prev => {
      const isLocking = !prev[dateStr];
      
      if (isLocking) {
        setHearingData(hPrev => {
          const newH = { ...hPrev };
          setSlotStatus(sPrev => {
            const newS = { ...sPrev };
            TIME_SLOTS.forEach(time => {
              const key = `${dateStr}-${time}`;
              newH[key] = { type: "horário bloqueado", notes: "BLOQUEADO POR DETERMINAÇÃO DO JUÍZO" };
              newS[key] = true;
            });
            EXTRA_POST_KEYS.forEach(key => {
              const fullKey = `${dateStr}-${key}`;
              newH[fullKey] = { type: "horário bloqueado", notes: "BLOQUEADO POR DETERMINAÇÃO DO JUÍZO" };
              newS[fullKey] = true;
            });
            return newS;
          });
          return newH;
        });
      } else {
        setHearingData(hPrev => {
          const newH = { ...hPrev };
          setSlotStatus(sPrev => {
            const newS = { ...sPrev };
            TIME_SLOTS.forEach(time => {
              const key = `${dateStr}-${time}`;
              newH[key] = { type: "horário vago", notes: "" };
              newS[key] = false;
            });
            EXTRA_POST_KEYS.forEach(key => {
              const fullKey = `${dateStr}-${key}`;
              newH[fullKey] = { type: "horário vago", notes: "" };
              newS[fullKey] = false;
            });
            return newS;
          });
          return newH;
        });
      }
      
      return {
        ...prev,
        [dateStr]: isLocking
      };
    });
  }, []);

  const toggleSlotStatus = useCallback((dateStr: string, time: string) => {
    const key = `${dateStr}-${time}`;
    if (lockedDays[dateStr]) return;

    setSlotStatus(prev => {
      const isChecking = !prev[key];
      if (!isChecking) {
        setHearingData(hPrev => ({
          ...hPrev,
          [key]: { type: "horário vago", notes: "", customTime: hPrev[key]?.customTime }
        }));
      }
      return { ...prev, [key]: isChecking };
    });
  }, [lockedDays]);

  const generateMonthData = useCallback((month: number, year: number): MonthInfo => {
    const date = new Date(year, month, 1);
    const days: DayInfo[] = [];
    const holidays = getHolidays(year);

    while (date.getMonth() === month) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayOfWeekIndex = date.getDay();
      const m = date.getMonth();
      const d = date.getDate();
      
      const isRecess = (m === 11 && d >= 20) || (m === 0 && d <= 6);
      const isSuspended = (m === 0 && d >= 7 && d <= 21);

      days.push({
        date: new Date(date),
        dayNumber: date.getDate(),
        dayOfWeek: DAYS_PT[dayOfWeekIndex],
        isWeekend: dayOfWeekIndex === 0 || dayOfWeekIndex === 6,
        isHoliday: !! holidays[dateStr],
        isRecess,
        isSuspended,
        holidayName: holidays[dateStr],
        dateStr
      });
      date.setDate(date.getDate() + 1);
    }

    return {
      name: MONTHS_PT[month],
      monthIndex: month,
      year,
      days
    };
  }, []);

  const monthInfo = useMemo(() => generateMonthData(selectedMonth, currentYear), [selectedMonth, currentYear, generateMonthData]);

  const activeTimeSlots = useMemo(() => {
    if (showEarlySlots) return TIME_SLOTS;
    return TIME_SLOTS.filter(t => t !== "08:00" && t !== "08:10" && t !== "08:20");
  }, [showEarlySlots]);

  const handleCellChange = useCallback((dateStr: string, time: string, field: keyof HearingSlot, value: string) => {
    const key = `${dateStr}-${time}`;
    if (lockedDays[dateStr]) return;

    setHearingData(prev => {
      const existing = prev[key] || { type: "horário vago", notes: "" };
      const updated = { ...existing, [field]: value };
      
      if (field === 'type' && value === 'horário bloqueado') {
        updated.notes = "ACOMODAÇÃO DA PAUTA";
      }
      
      return { ...prev, [key]: updated };
    });
  }, [lockedDays]);

  const getDayData = useCallback((dateStr: string, dayOfWeek: string) => {
    const data: { [time: string]: HearingSlot } = {};
    const status: { [time: string]: boolean } = {};
    
    const isFriday = dayOfWeek === "Sexta-feira";
    const isDayLocked = lockedDays[dateStr] !== undefined ? lockedDays[dateStr] : isFriday;

    TIME_SLOTS.forEach(time => {
      const key = `${dateStr}-${time}`;
      let slot = hearingData[key];
      let isMarked = slotStatus[key];

      if (!slot) {
        if (isDayLocked) {
          slot = { type: "horário bloqueado", notes: "BLOQUEADO POR DETERMINAÇÃO DO JUÍZO" };
          isMarked = true;
        } else if (time === "08:00" || time === "08:10" || time === "08:20") {
          slot = { type: "horário bloqueado", notes: "ACOMODAÇÃO DA PAUTA" };
          isMarked = true;
        } else {
          slot = { type: "horário vago", notes: "" };
          isMarked = false;
        }
      }

      data[time] = slot;
      status[time] = !!isMarked;
    });

    EXTRA_POST_KEYS.forEach(key => {
      const fullKey = `${dateStr}-${key}`;
      let slot = hearingData[fullKey];
      let isMarked = slotStatus[fullKey];

      if (!slot) {
        slot = { type: "horário vago", notes: "", customTime: "" };
        isMarked = false;
      }
      data[key] = slot;
      status[key] = !!isMarked;
    });
    
    return { data, status, isDayLocked };
  }, [hearingData, slotStatus, lockedDays]);

  const visibleDays = useMemo(() => {
    const today = new Date(todayDate);
    today.setHours(0, 0, 0, 0);

    return monthInfo.days.filter(day => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      
      if (dayDate < today) return false;

      const { isDayLocked } = getDayData(day.dateStr, day.dayOfWeek);
      const isLockedFriday = day.dayOfWeek === "Sexta-feira" && isDayLocked;
      
      if (showHiddenFridays) return true;
      return !isLockedFriday;
    });
  }, [monthInfo.days, getDayData, showHiddenFridays, todayDate]);

  const scrollToDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    setCurrentYear(year);
    setSelectedMonth(month);
    setIsCalendarOpen(false);

    setTimeout(() => {
      const el = document.getElementById(`row-${dateStr}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Pequeno efeito visual de realce temporário se quiser (opcional)
        el.classList.add('bg-blue-50');
        setTimeout(() => el.classList.remove('bg-blue-50'), 2000);
      }
    }, 150);
  };

  const findNextAvailableSlot = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    let startDate = new Date(todayDate);
    startDate.setHours(0, 0, 0, 0);
    
    let lastFoundDateStr = "";
    let lastFoundSlotId = "";

    if (lastFoundKey) {
      const parts = lastFoundKey.split('-');
      lastFoundDateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
      lastFoundSlotId = parts[3];
      
      const lastDate = new Date(lastFoundDateStr + "T00:00:00");
      if (lastDate >= startDate) startDate = lastDate;
    }

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      
      const year = checkDate.getFullYear();
      const month = checkDate.getMonth();
      const dayNum = checkDate.getDate();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayOfWeekIndex = checkDate.getDay();
      const dayOfWeek = DAYS_PT[dayOfWeekIndex];

      if (searchDayOfWeek && dayOfWeek !== searchDayOfWeek) continue;

      const holidays = getHolidays(year);
      const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;
      const isHoliday = !!holidays[dateStr];
      const isRecess = (month === 11 && dayNum >= 20) || (month === 0 && dayNum <= 6);
      const isSuspended = (month === 0 && dayNum >= 7 && dayNum <= 21);

      if (isWeekend || isHoliday || isRecess || isSuspended) continue;
      if (lockedDays[dateStr]) continue;

      const slotsToCheck = [...activeTimeSlots];
      if (showExtraPostSlots) slotsToCheck.push(...EXTRA_POST_KEYS);

      let startIndex = 0;
      if (dateStr === lastFoundDateStr && lastFoundSlotId) {
        startIndex = slotsToCheck.indexOf(lastFoundSlotId) + 1;
        if (startIndex >= slotsToCheck.length) continue; 
      }

      for (let s = startIndex; s < slotsToCheck.length; s++) {
        const time = slotsToCheck[s];
        if (searchTime && time !== searchTime) continue;

        const key = `${dateStr}-${time}`;
        const slot = hearingData[key];
        const isMarked = slotStatus[key];
        const isActuallyVago = !isMarked || (slot?.type === "horário vago");

        if (isActuallyVago) {
          setCurrentYear(year);
          setSelectedMonth(month);
          setLastFoundKey(key);
          setHighlightedKey(key);
          
          setTimeout(() => {
            const el = document.getElementById(`row-${dateStr}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);

          return;
        }
      }
    }
    
    alert("Fim da pauta. Nenhum outro horário vago encontrado com estes critérios nos próximos 12 meses.");
    setLastFoundKey(null);
  }, [todayDate, lastFoundKey, searchDayOfWeek, searchTime, lockedDays, hearingData, slotStatus, activeTimeSlots, showExtraPostSlots]);

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
    setLastFoundKey(null);
  };

  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setCurrentYear(prev => prev + 1); } 
    else { setSelectedMonth(prev => prev + 1); }
  };

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setCurrentYear(prev => prev - 1); } 
    else { setSelectedMonth(prev => prev - 1); }
  };

  const years = Array.from({ length: 11 }, (_, i) => 2025 + i);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900">
      <header className="bg-slate-900 text-white p-6 flex flex-col md:flex-row justify-between items-center z-10 border-b border-slate-800">
        <div className="flex items-center space-x-6 mb-4 md:mb-0">
          <JusticeAILogo className="w-40 md:w-56" />
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tight leading-none">
              Controle de Pauta - <span className="text-blue-500">4ª VT de Natal</span>
            </h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">
              JUSTIÇA DO TRABALHO • TRT 21ª REGIÃO
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center bg-slate-800/40 p-1.5 rounded-2xl border border-slate-700/50 space-y-2 shadow-xl">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex space-x-2 px-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">DIA DA SEMANA</span>
                <select 
                  value={searchDayOfWeek} 
                  onChange={(e) => {setSearchDayOfWeek(e.target.value); setLastFoundKey(null);}}
                  className="bg-slate-900/80 text-[12px] font-bold py-2 px-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-white w-40"
                >
                  <option value="">Qualquer dia</option>
                  {DAYS_PT.filter(d => d !== "Sábado" && d !== "Domingo").map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">HORÁRIO</span>
                <select 
                  value={searchTime} 
                  onChange={(e) => {setSearchTime(e.target.value); setLastFoundKey(null);}}
                  className="bg-slate-900/80 text-[12px] font-bold py-2 px-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-white w-32"
                >
                  <option value="">Qualquer hora</option>
                  {activeTimeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={findNextAvailableSlot}
              className="search-action-btn group flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-95 h-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span>LOCALIZAR PRÓXIMO</span>
            </button>
          </div>
          
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="w-full flex items-center justify-center space-x-3 bg-slate-700/60 hover:bg-slate-600/80 text-white py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-white/5 active:scale-95"
          >
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Abrir Calendário</span>
          </button>
        </div>

        <div className="flex items-center bg-slate-800/40 rounded-full px-6 py-2.5 space-x-6 border border-slate-700/50 mt-4 md:mt-0">
          <button onClick={prevMonth} className="p-1 hover:text-blue-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="flex items-center space-x-3">
            <span className="text-lg font-black text-white uppercase tracking-widest">{monthInfo.name}</span>
            <select 
              value={currentYear} 
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="bg-transparent text-lg font-black text-white focus:outline-none cursor-pointer hover:text-blue-400 appearance-none border-none outline-none"
            >
              {years.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
            </select>
          </div>

          <button onClick={nextMonth} className="p-1 hover:text-blue-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </header>

      <div className="bg-white p-3 flex flex-wrap justify-center gap-3 no-print border-b border-slate-200">
         <button 
            onClick={(e) => { e.stopPropagation(); setShowEarlySlots(!showEarlySlots); setLastFoundKey(null); }}
            className={`text-[11px] px-5 py-2 rounded-lg font-black transition-all border ${showEarlySlots ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
         >
           EXTRAS ANTE-PAUTA
         </button>
         <button 
            onClick={(e) => { e.stopPropagation(); setShowExtraPostSlots(!showExtraPostSlots); setLastFoundKey(null); }}
            className={`text-[11px] px-5 py-2 rounded-lg font-black transition-all border ${showExtraPostSlots ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
         >
           EXTRAS PÓS-PAUTA
         </button>
         <button 
            onClick={(e) => { e.stopPropagation(); setShowHiddenFridays(!showHiddenFridays); }}
            className={`text-[11px] px-5 py-2 rounded-lg font-black transition-all border ${showHiddenFridays ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
         >
           VER DIAS TRAVADOS
         </button>
      </div>

      <main ref={mainScrollRef} className="flex-1 overflow-auto bg-slate-100 custom-scrollbar">
        {visibleDays.length > 0 ? (
          <div className="min-w-max shadow-sm">
            <div className="flex sticky top-0 bg-[#E2E8F0] z-20 border-b border-slate-300 font-bold text-slate-700 uppercase tracking-wider">
              <div className="sticky left-0 z-30 w-8 py-4 flex items-center justify-center border-r border-slate-300 text-[11px] font-black bg-[#E2E8F0]">DIA</div>
              <div className="sticky left-8 z-30 w-10 py-4 flex items-center justify-center border-r border-slate-300 text-[11px] font-black text-center bg-[#E2E8F0]">SEM.</div>
              <div className="sticky left-[4.5rem] z-30 w-12 px-2 flex items-center justify-center border-r border-slate-300 text-[11px] font-black text-center bg-[#E2E8F0]">TRAVA</div>
              <div className="flex-1 flex items-center justify-center border-r border-slate-300 bg-slate-200 bg-opacity-40">
                <span className="text-sm font-black text-slate-800 tracking-[0.25em] py-4 uppercase">HORÁRIOS DISPONÍVEIS NA PAUTA</span>
              </div>
            </div>

            <div className="bg-white">
              {visibleDays.map((day) => {
                const { data, status, isDayLocked } = getDayData(day.dateStr, day.dayOfWeek);
                return (
                  <div key={day.dateStr} id={`row-${day.dateStr}`}>
                    <DayRow 
                      day={day}
                      isLocked={isDayLocked}
                      onToggleLock={() => toggleDayLock(day.dateStr)}
                      data={data}
                      slotStatus={status}
                      onToggleSlotStatus={(time) => toggleSlotStatus(day.dateStr, time)}
                      onCellChange={handleCellChange}
                      onClearHighlight={clearHighlight}
                      activeTimeSlots={activeTimeSlots}
                      showExtraPostSlots={showExtraPostSlots}
                      highlightedKey={highlightedKey}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <svg className="w-20 h-20 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div className="text-center">
              <p className="text-xl font-black text-slate-300 uppercase tracking-widest">Pauta Vazia</p>
              <button 
                onClick={goToToday}
                className="mt-4 text-blue-600 hover:text-blue-700 font-black text-xs uppercase tracking-widest border-b-2 border-blue-600/30 pb-1"
              >
                Retornar para Pauta Ativa
              </button>
            </div>
          </div>
        )}
      </main>

      <CalendarModal 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSelectDate={scrollToDate}
        currentYear={currentYear}
        currentMonth={selectedMonth}
      />

      <footer className="bg-white border-t border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-500 space-y-3 md:space-y-0 no-print">
        <div className="flex items-center space-x-6">
          <span className="bg-[#2563EB] text-white px-5 py-2 rounded-xl font-black shadow-lg">
            {todayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          <span className="text-slate-400 font-bold uppercase tracking-[0.2em]">AFA GESTÃO INTELIGENTE</span>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#FCD34D] rounded-md shadow-sm border border-slate-200"></div>
            <span className="font-black text-slate-700 uppercase tracking-tight">INICIAL</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#1E3A8A] rounded-md shadow-sm border border-slate-200"></div>
            <span className="font-black text-slate-700 uppercase tracking-tight">UNA</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#15803D] rounded-md shadow-sm border border-slate-200"></div>
            <span className="font-black text-slate-700 uppercase tracking-tight">INSTRUÇÃO</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#FB923C] rounded-md shadow-sm border border-slate-200"></div>
            <span className="font-black text-slate-700 uppercase tracking-tight">ENCERRAMENTO</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#7E22CE] rounded-md shadow-sm border border-slate-200"></div>
            <span className="font-black text-slate-700 uppercase tracking-tight">CONCILIAÇÃO</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
