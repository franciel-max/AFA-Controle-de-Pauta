
import React from 'react';
import { HEARING_TYPES } from '../constants';
import { HearingSlot } from '../types';

interface TimeCellProps {
  time: string; // ID do slot ou tempo fixo
  value: HearingSlot;
  isSet: boolean;
  onToggleSet: () => void;
  onChange: (field: keyof HearingSlot, val: string) => void;
  disabled?: boolean;
  isNonWorkingDay?: boolean;
  isRecess?: boolean;
  isSuspended?: boolean;
  isExtra?: boolean;
  isHighlighted?: boolean;
}

const TimeCell: React.FC<TimeCellProps> = ({ 
  time, 
  value, 
  isSet, 
  onToggleSet, 
  onChange, 
  disabled, 
  isNonWorkingDay,
  isRecess,
  isSuspended,
  isExtra,
  isHighlighted
}) => {
  // Cores de fundo baseadas no status
  const getBgColor = () => {
    if (isRecess) return 'bg-indigo-50';
    if (isSuspended) return 'bg-emerald-50';
    if (isNonWorkingDay) return 'bg-slate-100';
    
    const currentType = (value.type || "horário vago").toLowerCase();
    if (currentType === "horário bloqueado") return 'bg-red-50';
    if (isSet) {
      if (currentType.includes('inicial')) return 'bg-amber-50';
      if (currentType.includes('una')) return 'bg-blue-50';
      if (currentType.includes('instrução')) return 'bg-green-50';
      if (currentType.includes('encerramento')) return 'bg-orange-50';
      if (currentType.includes('conciliação')) return 'bg-purple-50';
      return 'bg-emerald-50';
    }
    return 'bg-white';
  };

  const getHeaderColor = () => {
    if (isRecess) return 'bg-indigo-200';
    if (isSuspended) return 'bg-emerald-200';
    if (isNonWorkingDay) return 'bg-slate-300';
    
    const currentType = (value.type || "horário vago").toLowerCase();
    if (currentType === "horário bloqueado") return 'bg-red-400';
    if (isSet) {
      if (currentType.includes('inicial')) return 'bg-amber-300';
      if (currentType.includes('una')) return 'bg-blue-900 text-white';
      if (currentType.includes('instrução')) return 'bg-green-700 text-white';
      if (currentType.includes('encerramento')) return 'bg-orange-400';
      if (currentType.includes('conciliação')) return 'bg-purple-700 text-white';
      return 'bg-emerald-300';
    }
    return 'bg-blue-50';
  };

  const isSelectDisabled = disabled || isNonWorkingDay || isRecess || isSuspended;
  const bgColor = getBgColor();
  const headerColor = getHeaderColor();

  return (
    <div 
      className={`flex flex-col border-r border-slate-200 min-w-[140px] h-full transition-all duration-300 ${bgColor} ${isHighlighted ? 'ring-4 ring-blue-600 ring-inset z-10' : ''}`}
    >
      {/* Cabeçalho da Célula (Horário) */}
      <div className={`py-1.5 px-2 text-[10px] font-bold border-b border-slate-200 flex items-center justify-between transition-colors ${headerColor}`}>
        <span className="flex items-center space-x-1 flex-1">
          {isExtra ? (
            <input 
              type="text"
              disabled={isSelectDisabled}
              value={value.customTime || ""}
              onChange={(e) => onChange('customTime', e.target.value)}
              placeholder="00:00"
              className={`bg-transparent border-b border-current w-12 text-center focus:outline-none placeholder-current/50 font-bold`}
            />
          ) : (
            <span>{time}</span>
          )}
          {isExtra && <span className="text-[8px] opacity-70 ml-1">EXT</span>}
        </span>

        {!isSelectDisabled && (
          <label className="cursor-pointer flex items-center group ml-2">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={isSet}
              onChange={onToggleSet}
            />
            <div className={`w-3.5 h-3.5 rounded border border-slate-400 flex items-center justify-center transition-all bg-white group-hover:border-blue-500`}>
              {isSet && (
                <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
              )}
            </div>
          </label>
        )}
      </div>

      {/* Corpo da Célula (Tipo de Audiência e Observações) */}
      <div className="flex-1 flex flex-col p-2 space-y-2">
        {(isNonWorkingDay || isRecess || isSuspended) ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <span className="text-[9px] font-bold uppercase tracking-tighter opacity-40 text-slate-500">
              {isRecess ? "RECESSO" : isSuspended ? "SUSPENSÃO" : "NÃO ÚTIL"}
            </span>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <label className="text-[8px] uppercase font-bold mb-1 tracking-tighter text-slate-400">TIPO DE AUDIÊNCIA</label>
              <select
                disabled={isSelectDisabled}
                value={value.type || "horário vago"}
                onChange={(e) => onChange('type', e.target.value)}
                className={`w-full text-[10px] p-1 rounded border border-slate-200 focus:outline-none bg-white font-medium`}
              >
                {HEARING_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col flex-1">
              <label className="text-[8px] uppercase font-bold mb-1 tracking-tighter text-slate-400">OBSERVAÇÕES</label>
              <textarea
                disabled={isSelectDisabled}
                className={`w-full flex-1 p-1 text-[10px] focus:outline-none resize-none rounded border border-slate-100 leading-tight bg-slate-50/50 hover:bg-white focus:bg-white transition-colors h-16`}
                placeholder={!isSelectDisabled ? "Observações da audiência..." : ""}
                value={value.notes}
                onChange={(e) => onChange('notes', e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(TimeCell);
