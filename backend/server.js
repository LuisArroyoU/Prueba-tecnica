require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();
const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const appointmentRoutes = require("./src/routes/appointmentRoutes");
app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => {
	res.send("API del Sistema de Gestión de Citas funcionando correctamente!");
});

app.listen(port, () => {
	console.log(`Backend server listening at http://localhost:${port}`);
});
