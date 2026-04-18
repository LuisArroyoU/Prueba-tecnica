const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Rutas de Citas
router.get("/conflicts/check", appointmentController.checkConflicts); // Endpoint especializado
router.get("/", appointmentController.getAppointments);
router.post("/", appointmentController.createAppointment);
router.get("/:id", appointmentController.getAppointmentById);
router.put("/:id", appointmentController.updateAppointment);
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;
