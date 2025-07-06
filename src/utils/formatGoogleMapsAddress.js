/**
 * Formatea una cadena de dirección de Google Maps para un formato más conciso
 * y retorna un objeto con las partes desglosadas y la dirección formateada.
 *
 * La función toma una dirección en el formato:
 * "Calle Número, Código Barrio Nombre Barrio, Provincia de Nombre Provincia, País"
 *
 * Y retorna un objeto con las siguientes propiedades:
 * - street: "Calle Número"
 * - neighborhood: "Nombre Barrio"
 * - province: "Nombre Provincia"
 * - country: "País"
 * - formatedAddress: "Calle Número, Nombre Barrio, Nombre Provincia"
 *
 * Ejemplos:
 * - Entrada: "De las Violetas 5997, B1684CMA Cdad. Jardin Lomas de Palomar, Provincia de Buenos Aires, Argentina"
 * - Salida: {
 * street: "De las Violetas 5997",
 * neighborhood: "Cdad. Jardin Lomas de Palomar",
 * province: "Buenos Aires",
 * country: "Argentina",
 * formatedAddress: "De las Violetas 5997, Cdad. Jardin Lomas de Palomar, Buenos Aires"
 * }
 *
 * @param {string} addressString La cadena de dirección completa de Google Maps.
 * @returns {object} Un objeto con las partes de la dirección y la dirección formateada.
 */
export function formatGoogleMapsAddress(addressString) {
    const parts = addressString.split(',').map(part => part.trim());

    let street = '';
    let neighborhood = '';
    let province = '';
    let country = '';
    let formattedParts = [];

    // 1. Procesar la primera parte (Calle y Número).
    if (parts[0]) {
        street = parts[0];
        formattedParts.push(street);
    }

    // 2. Procesar la segunda parte (Código Barrio Nombre Barrio).
    if (parts[1]) {
        const neighborhoodRaw = parts[1];
        const neighborhoodWords = neighborhoodRaw.split(' ');
        
        if (neighborhoodWords.length > 1) {
            // Elimina el primer elemento (el código postal/barrio)
            neighborhoodWords.shift(); 
            neighborhood = neighborhoodWords.join(' ');
        } else {
            neighborhood = neighborhoodRaw;
        }
        formattedParts.push(neighborhood);
    }

    // 3. Procesar la tercera parte (Provincia de Nombre Provincia).
    if (parts[2]) {
        let rawProvince = parts[2];
        if (rawProvince.startsWith('Provincia de ')) {
            province = rawProvince.replace('Provincia de ', '');
        } else {
            province = rawProvince;
        }
        formattedParts.push(province);
    }

    // 4. Procesar la cuarta parte (País).
    if (parts[3]) {
        country = parts[3];
    }

    // 5. Unir las partes formateadas para formatedAddress (sin el país).
    const formatedAddress = formattedParts.join(', ');

    return {
        street: street,
        neighborhood: neighborhood,
        province: province,
        country: country,
        formatedAddress: formatedAddress
    };
}