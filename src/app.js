// app.js
const express = require("express");
const cors = require("cors");

const { BASE_APP_URL } = require("./config/env");
const paymentController = require("./modules/payments/payment.controller");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: BASE_APP_URL,
    credentials: true,
  }),
);

/*
|--------------------------------------------------------------------------
| Stripe Webhook (Gets RAW body, placed before express.json)
|--------------------------------------------------------------------------
*/
app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.webhook,
);

/*
|--------------------------------------------------------------------------
| Global Parsers
|--------------------------------------------------------------------------
*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;
