# Society Maintenance Tracker

A full-stack platform for apartment societies to manage maintenance complaints. Residents raise complaints with photos and track their progress; admins manage complaints through a status workflow with priorities, overdue detection, and a notice board — with email notifications keeping everyone informed.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT + bcrypt, role-based (resident / admin)
- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **File uploads:** Multer (complaint photos)
- **Email:** Nodemailer (SMTP)

## Project Structure

```
society-maintenance-tracker/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── models/          # User, Complaint, Notice schemas
│   ├── middleware/       # JWT auth, role checks, photo upload
│   ├── controllers/      # Route logic
│   ├── routes/            # Express routers
│   ├── utils/             # Email helper, admin seed script
│   ├── uploads/           # Uploaded complaint photos (gitignored)
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/           # Axios client
│       ├── context/       # Auth context
│       ├── components/    # Navbar, badges, route guard
│       └── pages/         # Login, Register, complaints, notices, dashboard
├── README.md
└── SYSTEM_DESIGN.md
```


## Setup Guide

### Prerequisites
- Node.js (v18+)
- A MongoDB database (MongoDB Atlas free tier recommended)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/society-maintenance-tracker.git
cd society-maintenance-tracker
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env` with your real values (see table below), then:
```bash
node utils/seedAdmin.js   # creates the one admin account
node server.js            # starts the API on http://localhost:5000
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev                # starts the app on http://localhost:5173
```

The frontend dev server proxies `/api` and `/uploads` requests to `http://localhost:5000`, so no extra configuration is needed locally.

### Environment Variables (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `OVERDUE_THRESHOLD_DAYS` | Days a complaint can stay open before being flagged overdue |
| `CLIENT_URL` | Frontend URL, used for CORS |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | Email provider credentials (any free tier, e.g. Ethereal for testing or Gmail App Passwords) |
| `EMAIL_FROM` | From address shown on outgoing emails |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once by `seedAdmin.js` to create the admin account |

See `backend/.env.example` for a ready-to-copy template with placeholder values.

> **Note on email:** if `SMTP_USER`/`SMTP_PASS` are left blank, the app doesn't fail — it simply logs what *would* have been sent to the backend console. This keeps development unblocked without requiring real email credentials.

## Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| password | String | hashed with bcrypt before save |
| role | String | `resident` \| `admin` |
| flatNumber | String | optional |

### Complaint
| Field | Type | Notes |
|---|---|---|
| resident | ObjectId → User | required |
| category | String | enum: Plumbing, Electrical, Cleaning, Security, Lift, Parking, Noise, Other |
| description | String | required |
| photoUrl | String | path to uploaded photo, nullable |
| status | String | `Open` \| `In Progress` \| `Resolved` |
| priority | String | `Low` \| `Medium` \| `High` |
| history | Array | embedded list of `{ status, note, changedBy, changedByName, changedAt }` |
| resolvedAt | Date | set when status becomes Resolved |
| createdAt / updatedAt | Date | automatic timestamps |

### Notice
| Field | Type | Notes |
|---|---|---|
| title | String | required |
| content | String | required |
| important | Boolean | pins notice to top + triggers email to all residents |
| postedBy | ObjectId → User | required |
| createdAt / updatedAt | Date | automatic timestamps |

See `SYSTEM_DESIGN.md` for the reasoning behind the history model and overdue detection.

## API Documentation

All endpoints except `/auth/register` and `/auth/login` require a `Bearer <token>` header.

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new resident account |
| POST | `/api/auth/login` | Public | Log in, returns JWT + user |
| GET | `/api/auth/me` | Authenticated | Get current user's profile |

### Complaints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/complaints` | Resident | Create a complaint (multipart form: category, description, photo) |
| GET | `/api/complaints/mine` | Resident | List own complaints with full history |
| GET | `/api/complaints` | Admin | List all complaints; query params: `category`, `status`, `dateFrom`, `dateTo`; overdue-first sort |
| GET | `/api/complaints/:id` | Owner or Admin | Get a single complaint |
| PATCH | `/api/complaints/:id/status` | Admin | Update status; body: `{ status, note }`; appends to history, emails resident |
| PATCH | `/api/complaints/:id/priority` | Admin | Update priority; body: `{ priority }` |

### Notices
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/notices` | Authenticated | List notices, pinned/important first |
| POST | `/api/notices` | Admin | Create a notice; body: `{ title, content, important }`; emails all residents if important |
| DELETE | `/api/notices/:id` | Admin | Delete a notice |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Admin | Aggregated stats: total, by status, by category, overdue count |

## Example: Raising a Complaint (curl)
```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Authorization: Bearer <token>" \
  -F "category=Plumbing" \
  -F "description=Leaking tap in the kitchen" \
  -F "photo=@/path/to/photo.jpg"
```

## Example: Updating Status (curl)
```bash
curl -X PATCH http://localhost:5000/api/complaints/<id>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress", "note": "Plumber scheduled for tomorrow"}'
```

## Deployment

**Live app:** https://society-maintenance-tracker-delta.vercel.app

## System Design

See [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) for a write-up on the complaint history model, overdue detection, photo handling, and notification flow.