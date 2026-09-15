# SecretAdmirer

# Secret Admirer

A simple anonymous messaging web application that lets users send secret messages through a unique link or email.

## Features

* Write anonymous letters
* Create drawings using HTML5 Canvas
* Share messages through unique links
* Send message links via email
* Optional sender alias or initials
* Responsive and minimal UI

## Tech Stack

**Frontend**

* React
* Vite
* React Router
* Supabase
* Phosphor Icons

**Backend**

* Node.js
* Express
* Nodemailer

**Services**

* Supabase Database
* Supabase Storage
* Vercel
* Render

## Project Structure

```text
SecretAdmirer/
├── client/     # React frontend
├── server/     # Express backend
└── README.md
```

## Setup

### Frontend

```bash
cd client
npm install
npm run dev
```

Create `client/.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_API_URL=http://localhost:5000/api
```

### Backend

```bash
cd server
npm install
npm run dev
```

Create `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

## Database

Supabase is used for storing message records, while Supabase Storage is used for drawings.

## Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database & Storage:** Supabase

## License

For educational and personal project use.
