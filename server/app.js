require("dotenv").config();
const express = require("express");
const cors = require("cors");
const reportRoutes = require("./routes/reports");

const app = express();

app.use(cors()); // Apply CORS middleware
app.use(express.json()); // Parse JSON bodies
app.use("/api/reports", reportRoutes); // Setup routes for reports

module.exports = app; // Export the Express app
