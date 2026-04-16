/**
 * Utilitário para lidar com datas vindas do Backend Java (Spring Boot)
 * O Java pode retornar LocalDate como String "yyyy-MM-dd" ou 
 * como Array [yyyy, mm, dd] dependendo da configuração.
 */
export const parseJavaDate = (date: any): string => {
  if (!date) return '';

  // Se for Array: [2026, 4, 16]
  if (Array.isArray(date)) {
    const [year, month, day] = date;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  // Se for String com tempo: "2026-04-16T12:00:00" -> pega só a data
  if (typeof date === 'string' && date.includes('T')) {
    return date.split('T')[0];
  }

  // Se já for string simples "2026-04-16"
  return String(date);
};

/**
 * Formata uma data para exibição no padrão brasileiro
 */
export const formatDisplayDate = (date: any): string => {
  const parsed = parseJavaDate(date);
  if (!parsed) return 'N/A';
  
  const [year, month, day] = parsed.split('-');
  return `${day}/${month}/${year}`;
};
