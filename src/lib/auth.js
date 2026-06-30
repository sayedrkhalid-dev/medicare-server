const app = require("../app");
const mongoose = require("mongoose");
const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const { toNodeHandler } = require("better-auth/node");
const { getDB } = require("../config/db");

const {
  BASE_APP_URL,
  BETTER_AUTH_URL,
  BETTER_AUTH_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = require("../config/env");

let auth;

const initAuth = () => {
  const db = getDB();
  if (!db)
    throw new Error("DB not connected yet — call initAuth after connectDB()");

  auth = betterAuth({
    baseURL: BETTER_AUTH_URL,
    secret: BETTER_AUTH_SECRET,
    trustedOrigins: [BASE_APP_URL],
    database: mongodbAdapter(db),

    advanced: {
      crossSubDomainCookies: {
        enabled: false, // you're cross-DOMAIN, not cross-subdomain, so leave this off
      },
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      },
    },

    emailAndPassword: {
      enabled: true,
    },

    socialProviders: {
      google: {
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
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
