/**
 * Verifica si un timestamp de Firebase pertenece al mes actual.
 * @param {object} timestamp - El objeto Timestamp de Firebase.
 * @returns {boolean} - true si el timestamp es del mes actual, false en caso contrario.
 */
export function isCurrentMonth(timestamp) {
  if (!timestamp) {
    return false;
  }
  const creationDate = timestamp.toDate();
  const currentDate = new Date();
  
  return (
    creationDate.getFullYear() === currentDate.getFullYear() &&
    creationDate.getMonth() === currentDate.getMonth()
  );
}