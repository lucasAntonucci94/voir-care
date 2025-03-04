// utils/dateUtils.js

/**
 * Formatea un timestamp para mostrar en el header de un post de red social
 * Si recibe un Date nativo, lo retorna sin cambios
 *
 * @param {Object|Date} date - Objeto con seconds y nanoseconds o Date nativo
 * @param {number} [date.seconds] - Segundos desde epoch
 * @param {number} [date.nanoseconds] - Nanosegundos
 * @returns {string|Date} Fecha formateada o Date original si es nativo
 */
export function formatTimestamp(date) {
    // Validar si el argumento es undefined o null
    if (date === undefined || date === null) {
        return;
    }

    // Si es un objeto Date nativo, retornarlo sin procesar
    if (date instanceof Date && !isNaN(date)) {
        return date;
    }

    // Si no es un Date nativo, asumir que es un objeto con seconds y nanoseconds
    const { seconds, nanoseconds } = date;

    // Validar que seconds y nanoseconds sean números válidos
    if (typeof seconds !== 'number' || typeof nanoseconds !== 'number' || 
        isNaN(seconds) || isNaN(nanoseconds)) {
        throw new Error('Las propiedades seconds y nanoseconds deben ser números válidos');
    }

    // Convertir a milisegundos
    const milliseconds = (seconds * 1000) + (nanoseconds / 1000000);
    const postDate = new Date(milliseconds);
    const now = new Date(); // Fecha actual
    const diffMs = now - postDate; // Diferencia en milisegundos

    // Calcular diferencias
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Formato relativo para posts recientes
    if (diffDays < 1) {
        if (diffHours < 1) {
            if(diffMinutes < 1) {
                return 'hace unos segundos';
            }
            return `hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
        }
        return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    }
    
    // Ayer
    if (diffDays === 1) {
        const hour = String(postDate.getHours()).padStart(2, '0');
        const minute = String(postDate.getMinutes()).padStart(2, '0');
        return `ayer ${hour}:${minute}`;
    }

    // Formato completo para fechas más antiguas
    const day = String(postDate.getDate()).padStart(2, '0');
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    const year = postDate.getFullYear().toString().slice(-2); // Últimos 2 dígitos
    return `${day}/${month}/${year}`;
}