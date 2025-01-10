const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");

//Middlewares
const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");

//Routes
const reservationsRouter = require("./reservations/reservations.router");
const tablesRouter = require("./tables/tables.router");

const app = express();

app.use(cors());
app.use(express.json());
app.options("*", cors());

app.get("/", (req, res) => res.send("Welcome to the Restaurant Reservation Capstone API"))

app.use("/reservations", reservationsRouter);
app.use("/tables", tablesRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;