const app = require("../app");
const mongoose = require("mongoose");
const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const { toNodeHandler } = require("better-auth/node");
const { getDB } = require("../config/db");

let auth;

const initAuth = () => {
  const db = getDB();
  if (!db)
    throw new Error("DB not connected yet — call initAuth after connectDB()");

  auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL, // e.g. http://localhost:8080
    trustedOrigins: ["http://localhost:3000"],
    database: mongodbAdapter(db),

    emailAndPassword: {
      enabled: true,
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },

    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "patient",
        },

        gender: {
          type: "string",
          required: true,
          defaultValue: "male",
        },

        phone: {
          type: "string",
          required: false,
          defaultValue: "",
        },

        address: {
          type: "string",
          required: false,
          defaultValue: "",
        },

        dateOfBirth: {
          type: "string",
          required: false,
          defaultValue: "",
        },

        bloodGroup: {
          type: "string",
          required: false,
          defaultValue: "",
        },

        status: {
          type: "string",
          required: true,
          defaultValue: "active",
        },
      },
    },
  });

  return auth;
};

const getAuth = () => auth;

const mountAuth = (app, authObj) => {
  app.use("/api/auth", toNodeHandler(authObj));
};

module.exports = { initAuth, getAuth, mountAuth };
