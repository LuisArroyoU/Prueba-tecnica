const Appointment = require("../models/Appointment");
const { findConflicts } = require("../services/appointmentService");

/**
 * Función auxiliar para verificar si una fecha es anterior a hoy,
 * basándonos estrictamente en la fecha actual del servidor.
 */
const isDateInPast = (dateInput) => {
    let checkDateStr = "";
    if (dateInput && typeof dateInput.toISOString === 'function') {
        checkDateStr = dateInput.toISOString().split('T')[0];
    } else {
        checkDateStr = String(dateInput).split('T')[0]; // asume YYYY-MM-DD
    }
    
    // Obtenemos la fecha local actual en formato YYYY-MM-DD para comparar textualmente
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    return checkDateStr < todayStr;
};

// GET /api/appointments
exports.getAppointments = async (req, res) => {
    try {
        const { startDate, endDate, doctorName, status } = req.query;
        // Paginación (con valores por defecto 10)
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        let query = {};

        if (doctorName) {
            query.doctorName = { $regex: new RegExp(doctorName, "i") }; // Búsqueda case-insensitive
        }

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(`${startDate}T00:00:00.000Z`);
            }
            if (endDate) {
                query.date.$lte = new Date(`${endDate}T23:59:59.999Z`);
            }
        }

        // Ejecutar conteo total y búsqueda de forma paralela para mayor eficiencia
        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .sort({ date: 1, startTime: 1 })
                .skip(skip)
                .limit(limit),
            Appointment.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            data: appointments,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las citas", error: error.message });
    }
};

// GET /api/appointments/:id
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Cita no encontrada" });
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la cita", error: error.message });
    }
};

// POST /api/appointments
exports.createAppointment = async (req, res) => {
    try {
        const { date, startTime, endTime, doctorName } = req.body;

        // Validaciones críticas
        if (isDateInPast(date)) {
            return res.status(400).json({ message: "La fecha de la cita no puede ser en el pasado" });
        }

        if (endTime <= startTime) {
            return res.status(400).json({ message: "La hora de fin debe ser posterior a la de inicio" });
        }

        // Buscar conflictos
        const conflicts = await findConflicts(doctorName, date, startTime, endTime);

        if (conflicts.length > 0) {
            return res.status(409).json({
                message: "Hay solapamiento con citas existentes del doctor",
                conflicts: conflicts
            });
        }

        // Si no hay problemas, crear cita
        const newAppointment = new Appointment(req.body);
        const savedAppointment = await newAppointment.save();
        res.status(201).json(savedAppointment);

    } catch (error) {
        // En caso de errores de validación de mongoose u otros
        res.status(400).json({ message: "Error al crear la cita", error: error.message });
    }
};

// PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { date, startTime, endTime, doctorName } = req.body;

        const existingAppointment = await Appointment.findById(appointmentId);
        if (!existingAppointment) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }

        // Para las validaciones usamos los datos del body si existen, o los existentes si no
        const checkDate = date || existingAppointment.date;
        const checkStart = startTime || existingAppointment.startTime;
        const checkEnd = endTime || existingAppointment.endTime;
        const checkDoctor = doctorName || existingAppointment.doctorName;

        if (date && isDateInPast(checkDate)) {
            return res.status(400).json({ message: "La fecha de la cita no puede ser en el pasado" });
        }

        if (checkEnd <= checkStart) {
            return res.status(400).json({ message: "La hora de fin debe ser posterior a la de inicio" });
        }

        const conflicts = await findConflicts(checkDoctor, checkDate, checkStart, checkEnd, appointmentId);

        if (conflicts.length > 0) {
            return res.status(409).json({
                message: "Hay solapamiento con citas existentes del doctor al intentar actualizar",
                conflicts: conflicts
            });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, req.body, { new: true, runValidators: true });
        res.status(200).json(updatedAppointment);

    } catch (error) {
        res.status(400).json({ message: "Error al actualizar la cita", error: error.message });
    }
};

// DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        res.status(200).json({ message: "Cita eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la cita", error: error.message });
    }
};

// GET /api/appointments/conflicts/check
exports.checkConflicts = async (req, res) => {
    try {
        const { doctorName, date, startTime, endTime, excludeId } = req.query;

        if (!doctorName || !date || !startTime || !endTime) {
            return res.status(400).json({ message: "Faltan parámetros obligatorios (doctorName, date, startTime, endTime)" });
        }

        const conflicts = await findConflicts(doctorName, date, startTime, endTime, excludeId);
        
        res.status(200).json({
            hasConflicts: conflicts.length > 0,
            conflicts: conflicts
        });
    } catch (error) {
        res.status(500).json({ message: "Error al comprobar conflictos", error: error.message });
    }
};
