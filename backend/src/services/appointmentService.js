const Appointment = require("../models/Appointment");

/**
 * Busca citas conflictivas para un doctor en una fecha y rango horario específico.
 * Lógica de solapamiento: (nuevaInicio < existenteFin) AND (nuevaFin > existenteInicio)
 * 
 * @param {String} doctorName 
 * @param {Date|String} date - Fecha de la cita (idealmente YYYY-MM-DD o Date object)
 * @param {String} startTime - Hora de inicio (HH:mm)
 * @param {String} endTime - Hora de fin (HH:mm)
 * @param {String} excludeId - (Opcional) ID de una cita a excluir de la búsqueda (útil para actualización)
 * @returns {Promise<Array>} Array de citas conflictivas
 */
const findConflicts = async (doctorName, date, startTime, endTime, excludeId = null) => {
    // Normalizamos la fecha, la convertimos a UTC manual asegurada si viene de string YYYY-MM-DD
    let dateStr = "";
    if (date && typeof date.toISOString === 'function') {
        dateStr = date.toISOString().split('T')[0];
    } else {
        dateStr = String(date).split('T')[0];
    }

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    // Construimos la consulta base
    const query = {
        doctorName: doctorName,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        status: { $ne: "cancelled" }, // Las citas canceladas no generan conflicto
        $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
        ]
    };

    // Si pasamos un excludeId, lo excluimos de la búsqueda
    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    return await Appointment.find(query);
};

module.exports = {
    findConflicts
};
