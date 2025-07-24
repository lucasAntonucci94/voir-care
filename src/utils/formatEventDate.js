/**
 * Formatea una fecha de evento en el formato que retorna Firebase
 *
 * Y retorna un objeto con las siguientes propiedades:
 * - Salida: {
 * - day: day,
 * - month: month,
 * - year: year,
 * - time: time,
 * - label: `${dayOfWeek}, ${day} de ${month} de ${year} a las ${time}`
 * }
 *
 * @param {string} tiemstamp La fecha a formatear en el formato que retorna firebase (seconds, nanoseconds).
 * @returns {object} Un objeto con las partes de la dirección y la dirección formateada.
 */
export function formatEventDate(timestamp) {
  if (!timestamp) return { dayBox: 'N/A', label: 'Fecha no definida' };
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const dayOfWeek = days[date.getUTCDay()];
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const time = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return {
    day: day,
    month: month,
    year: year,
    time: time,
    label: `${dayOfWeek}, ${day} de ${month} de ${year} a las ${time}`
  };
}