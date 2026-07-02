# MediCare — Server

The **backend API** for MediCare, a doctor appointment and healthcare consultation platform. Built with Express and MongoDB, it powers authentication, doctor discovery, appointment scheduling, prescriptions, payments, and reviews for the [MediCare client](https://github.com/sayedrkhalid-dev/medicare-client).

**Live API:** [medicare-server-isbj.onrender.com](https://medicare-server-isbj.onrender.com/)
**Frontend App:** [medicare-client-ruddy.vercel.app](https://medicare-client-ruddy.vercel.app/)
**Frontend Repo:** [medicare-client](https://github.com/sayedrkhalid-dev/medicare-client)

---

## Overview

MediCare Server exposes a REST API consumed by the MediCare frontend. It implements role-based access control for three user types — **patient**, **doctor**, and **admin** — and handles the full lifecycle of a medical appointment: doctor onboarding, scheduling, booking, prescriptions, payment, and review.

### Key Features

- **Authentication** — Email/password and Google OAuth via [Better Auth](https://www.better-auth.com/), with cookie-based sessions
- **Role-Based Authorization** — Middleware-enforced permissions for `patient`, `doctor`, and `admin` roles
- **Doctor Applications** — Doctors apply to join the platform; admins approve, reject, or request resubmission
- **Doctor Schedules** — Doctors define recurring availability; time slots are generated automatically
- **Appointments** — Slot-based booking, cancellation, and per-role appointment views
- **Prescriptions** — Doctors issue prescriptions tied to appointments; patients and admins can retrieve them
- **Payments** — Stripe Checkout integration with webhook-based payment reconciliation
- **Reviews** — Patients rate and review doctors after appointments
- **User Management** — Admins can suspend/activate users and doctors
- **Centralized Error Handling** — Consistent error responses via custom middleware
- **Schema Validation** — Request validation using [Zod](https://zod.dev/)

---

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | [Node.js](https://nodejs.org/) |
| Framework | [Express 5](https://expressjs.com/) |
| Database | [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) |
| Authentication | [Better Auth](https://www.better-auth.com/) (MongoDB adapter, Google OAuth) |
| Payments | [Stripe](https://stripe.com/) |
| Validation | [Zod](https://zod.dev/) |
| Password Hashing | [bcrypt](https://www.npmjs.com/package/bcrypt) |
| Tokens | [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) |
| Dev Tooling | Nodemon, ESLint, Prettier |
| Deployment | [Render](https://render.com/) |

---

## Project Structure

```
medicare-server/
├── src/
│   ├── app.js                     # Express app setup (CORS, Stripe webhook, parsers)
│   ├── server.js                  # Entry point: DB connect → auth init → routes → listen
│   ├── routes.js                  # Central route registration
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── env.js                 # Environment variable loader
│   ├── lib/
│   │   ├── auth.js                # Better Auth configuration & mounting
│   │   └── stripe.js              # Stripe client setup
│   ├── middlewares/
│   │   ├── authenticate.js        # Session/user authentication
│   │   ├── authorize.js           # Role-based access control
│   │   ├── validate.js            # Zod schema validation
│   │   ├── errorHandler.js        # Global error handler
│   │   └── notFound.js            # 404 handler
│   ├── modules/
│   │   ├── users/                 # User profiles & admin user management
│   │   ├── doctors/                # Doctor profiles, suspend/activate
│   │   ├── doctorApplications/    # Doctor onboarding workflow
│   │   ├── doctorSchedules/       # Doctor availability & slot generation
│   │   ├── appointments/          # Booking, cancellation, listings
│   │   ├── prescriptions/          # Prescription issuance & retrieval
│   │   ├── payments/               # Stripe checkout, verification, reconciliation
│   │   └── reviews/                 # Doctor reviews & ratings
│   └── utils/
│       ├── generateTimeSlots.js
│       └── time.js
└── package.json
```

Each module follows a consistent pattern: `*.routes.js` → `*.controller.js` → `*.service.js` → `*.model.js`, with `*.validation.js` and `*.constants.js` where relevant.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A [MongoDB](https://www.mongodb.com/) database (local or Atlas)
- A [Stripe](https://stripe.com/) account for payment features
- A [Google Cloud OAuth](https://console.cloud.google.com/) client for social login

### Installation

```bash
git clone https://github.com/sayedrkhalid-dev/medicare-server.git
cd medicare-server
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=8080

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Better Auth
BETTER_AUTH_URL=http://localhost:8080
BETTER_AUTH_SECRET=your_better_auth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App URLs (used for CORS & trusted origins)
BASE_APP_URL=http://localhost:3000
BASE_API_URL=http://localhost:8080

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

> In production, set `BASE_APP_URL` to your deployed frontend (e.g. `https://medicare-client-ruddy.vercel.app`) and `BASE_API_URL`/`BETTER_AUTH_URL` to your deployed API (e.g. `https://medicare-server-isbj.onrender.com`).

### Run the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:8080`.

### Run in Production

```bash
npm run start
```

---

## API Reference

Base URL (production): `https://medicare-server-isbj.onrender.com`

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Returns a simple health-check message |

### Auth

Handled by Better Auth and mounted automatically at `/api/auth/*` (email/password sign-up & sign-in, Google OAuth, session management).

### Users — `/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/me` | Authenticated | Get current user profile |
| `PATCH` | `/me` | Authenticated | Update current user profile |
| `GET` | `/` | Admin | List all users |
| `GET` | `/:userId` | Authenticated | Get a user by ID |
| `PATCH` | `/:userId/suspend` | Admin | Suspend a user |
| `PATCH` | `/:userId/activate` | Admin | Activate a user |

### Doctors — `/doctors`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/all` | Public | List all doctors |
| `GET` | `/:doctorId` | Public | Get a doctor's profile |
| `GET` | `/me/profile` | Doctor | Get own doctor profile |
| `PATCH` | `/:doctorId/suspend` | Admin | Suspend a doctor |
| `PATCH` | `/:doctorId/activate` | Admin | Activate a doctor |

### Doctor Applications — `/doctor-applications`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Doctor | Submit an application |
| `GET` | `/me` | Doctor | View own applications |
| `PATCH` | `/:applicationId/resubmit` | Doctor | Resubmit a rejected application |
| `GET` | `/` | Admin | List all applications |
| `GET` | `/:applicationId` | Admin | Get an application by ID |
| `PATCH` | `/:applicationId/approve` | Admin | Approve an application |
| `PATCH` | `/:applicationId/reject` | Admin | Reject an application |

### Doctor Schedules — `/doctor-schedules`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/create` | Doctor | Create a schedule |
| `GET` | `/me` | Doctor | Get own schedules |
| `GET` | `/:doctorId` | Public | Get a doctor's schedules |
| `PATCH` | `/:scheduleId` | Doctor | Update a schedule |
| `PATCH` | `/:scheduleId/activate` | Doctor | Activate a schedule |
| `PATCH` | `/:scheduleId/deactivate` | Doctor | Deactivate a schedule |
| `DELETE` | `/:scheduleId` | Doctor | Delete a schedule |

### Appointments — `/appointments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/available-slots` | Public | Get available booking slots |
| `GET` | `/patient-appointments` | Patient | Get the patient's appointments |
| `GET` | `/doctor-appointments` | Doctor | Get the doctor's appointments |
| `GET` | `/all` | Admin | List all appointments |
| `GET` | `/:appointmentId` | Authenticated | Get an appointment by ID |
| `PATCH` | `/:appointmentId/cancel` | Patient | Cancel an appointment |

### Prescriptions — `/prescriptions`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Doctor | Create a prescription |
| `GET` | `/all` | Admin | List all prescriptions |
| `GET` | `/me` | Patient | Get own prescriptions |
| `GET` | `/:prescriptionId` | Authenticated | Get a prescription by ID |

### Payments — `/payments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/checkout` | Patient | Create a Stripe checkout session |
| `POST` | `/webhook` | Stripe | Stripe webhook handler (raw body) |
| `GET` | `/verify/:sessionId` | Patient | Verify a checkout session |
| `GET` | `/me` | Patient | Get own payment history |
| `POST` | `/:id/reconcile` | Admin | Manually reconcile a payment |
| `GET` | `/` | Admin | List all payments |
| `GET` | `/:id` | Patient / Admin | Get a payment by ID |

### Reviews — `/reviews`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/doctor/:doctorId` | Public | Get reviews for a doctor |
| `POST` | `/` | Patient | Create a review |
| `GET` | `/me` | Patient | Get own reviews |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the server with Nodemon (auto-restart) |
| `npm run start` | Starts the server for production |

---

## Deployment

The API is deployed on **Render** and available at:
🔗 [https://medicare-server-isbj.onrender.com](https://medicare-server-isbj.onrender.com/)

> Note: free-tier Render services spin down after inactivity, so the first request after idle time may take a few seconds to respond.

---

## Related Repository

- **Frontend / Client:** [github.com/sayedrkhalid-dev/medicare-client](https://github.com/sayedrkhalid-dev/medicare-client)

---

## License

This project is licensed under the **ISC License**.

## Author

**Sayed R. Khalid (Al-amin)**
GitHub: [@sayedrkhalid-dev](https://github.com/sayedrkhalid-dev)
