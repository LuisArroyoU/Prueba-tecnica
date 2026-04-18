const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
    {
        patientName: {
            type: String,
            required: [true, "El nombre del paciente es requerido"],
            trim: true,
        },
        doctorName: {
            type: String,
            required: [true, "El nombre del doctor es requerido"],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, "La fecha es requerida"],
        },
        startTime: {
            type: String,
            required: [true, "La hora de inicio es requerida"],
            match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validación de formato HH:mm
        },
        endTime: {
            type: String,
            required: [true, "La hora de fin es requerida"],
            match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validación de formato HH:mm
        },
        reason: {
            type: String,
            required: [true, "El motivo de la cita es requerido"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
