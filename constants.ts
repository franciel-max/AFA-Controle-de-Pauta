
export const TIME_SLOTS = [
  "08:00", "08:10", "08:20", "08:30", "08:40", "08:50", "09:00", 
  "09:10", "09:20", "09:30", "09:45", "10:00", "10:30"
];

export const EXTRA_POST_KEYS = ["extra1", "extra2"];

export const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const DAYS_PT = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", 
  "Quinta-feira", "Sexta-feira", "Sábado"
];

export const HEARING_TYPES = [
  "horário vago",
  "inicial híbrida", "inicial telepresencial", "inicial presencial",
  "una híbrida", "una telepresencial", "una presencial",
  "instrução híbrida", "instrução telepresencial", "instrução presencial",
  "encerramento híbrida", "encerramento telepresencial", "encerramento presencial",
  "conciliação híbrida", "conciliação telepresencial", "conciliação presencial",
  "horário bloqueado"
];

/**
 * Calcula a data da Páscoa para um determinado ano usando o algoritmo de Meeus/Jones/Butcher.
 * Retorna um objeto Date.
 */
const getEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

/**
 * Formata uma data para o padrão YYYY-MM-DD usado nas chaves do mapa de feriados.
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getHolidays = (year: number): { [key: string]: string } => {
  const easter = getEaster(year);
  
  // Carnaval (Terça-feira): 47 dias antes da Páscoa
  const carnavalDate = new Date(easter);
  carnavalDate.setDate(easter.getDate() - 47);
  
  // Segunda de Carnaval: 48 dias antes da Páscoa
  const carnavalMon = new Date(easter);
  carnavalMon.setDate(easter.getDate() - 48);

  // Quarta-feira de Cinzas: 46 dias antes da Páscoa
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);

  // Semana Santa
  // Quarta-feira Santa: 4 dias antes da Páscoa
  const passionWednesday = new Date(easter);
  passionWednesday.setDate(easter.getDate() - 4);
  
  // Quinta-feira Santa: 3 dias antes da Páscoa
  const passionThursday = new Date(easter);
  passionThursday.setDate(easter.getDate() - 3);

  // Sexta-feira da Paixão: 2 dias antes da Páscoa
  const passionFriday = new Date(easter);
  passionFriday.setDate(easter.getDate() - 2);

  // Corpus Christi: 60 dias após a Páscoa
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  const holidays: { [key: string]: string } = {
    [`${year}-01-01`]: "Ano Novo",
    [formatDate(carnavalMon)]: "Carnaval (Segunda)",
    [formatDate(carnavalDate)]: "Carnaval (Terça)",
    [formatDate(ashWednesday)]: "Quarta-feira de Cinzas",
    [formatDate(passionWednesday)]: "Quarta-feira Santa",
    [formatDate(passionThursday)]: "Quinta-feira Santa",
    [formatDate(passionFriday)]: "Sexta-feira da Paixão",
    [`${year}-04-21`]: "Tiradentes",
    [`${year}-05-01`]: "Dia do Trabalho",
    [formatDate(corpusChristi)]: "Corpus Christi",
    [`${year}-06-24`]: "São João",
    [`${year}-06-29`]: "São Pedro",
    [`${year}-08-11`]: "Dia do Advogado",
    [`${year}-09-07`]: "Independência do Brasil",
    [`${year}-10-03`]: "Feriado Prorrogado",
    [`${year}-10-12`]: "Nossa Sra. Aparecida",
    [`${year}-11-01`]: "Todos os Santos",
    [`${year}-11-02`]: "Finados",
    [`${year}-11-15`]: "Proclamação da República",
    [`${year}-11-21`]: "Feriado Local",
    [`${year}-12-08`]: "Nossa Sra. da Conceição",
    [`${year}-12-25`]: "Natal",
  };

  return holidays;
};
