
export function formatTimestamp(date) {
    if (date === undefined || date === null) return;

    if (date instanceof Date && !isNaN(date)) {
        return date;
    }

    const { seconds, nanoseconds } = date;

    if (typeof seconds !== 'number' || typeof nanoseconds !== 'number' || 
        isNaN(seconds) || isNaN(nanoseconds)) {
        throw new Error('Las propiedades seconds y nanoseconds deben ser números válidos');
    }

    const milliseconds = (seconds * 1000) + (nanoseconds / 1000000);
    const postDate = new Date(milliseconds);
    const now = new Date();

    const diffMs = postDate - now;
    const isFuture = diffMs > 0;

    const absDiffMs = Math.abs(diffMs);
    const diffMinutes = Math.floor(absDiffMs / (1000 * 60));
    const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
        if (diffHours < 1) {
            if(diffMinutes < 1) {
                return isFuture ? 'en unos segundos' : 'hace unos segundos';
            }
            return isFuture ? `en ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}` : `hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
        }
        return isFuture ? `en ${diffHours} hora${diffHours !== 1 ? 's' : ''}` : `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    }

    if (diffDays === 1) {
        const hour = String(postDate.getHours()).padStart(2, '0');
        const minute = String(postDate.getMinutes()).padStart(2, '0');
        return isFuture ? `mañana ${hour}:${minute}` : `ayer ${hour}:${minute}`;
    }

    const day = String(postDate.getDate()).padStart(2, '0');
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    const year = postDate.getFullYear().toString().slice(-2);

    return `${day}/${month}/${year}`;
}