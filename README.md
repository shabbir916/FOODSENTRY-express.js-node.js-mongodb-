# FOODSENTRY – Backend System 

FOODSENTRY is a backend system built with **Node.js, Express, and MongoDB**.  
**Problem it Solves**: Food waste is a global issue due to poor
inventory management. FoodSentry tracks pantry items and suggests recipes
to use them before expiry.
This backend is designed with a **clean, scalable folder structure** and is deployed on **Render**.


## Live Backend URL
https://foodsentry-express-js-node-js-mongodb-1.onrender.com


## Key Features

- User authentication using **JWT**
- **Google OAuth 2.0** login support
- Secure protected routes
- Pantry management (add, view, update items)
- Expiry tracking for pantry items
- Automated **expiry email notifications**
- Background jobs & cron scheduling
- Clean MVC-style folder structure
- Production deployment on Render


## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Google OAuth 2.0**
- **Nodemailer (Emails)**
- **Cron Jobs**
- **Socket.IO (real-time features)**
- **Render (Deployment)**


## Folder Structure
Below is a high-level overview of the project structure (non-essential files omitted for clarity):

```text
FOODSENTRY/
│
├── src/
│   ├── config/
│   │   ├── email.js
│   │   └── googleAuth.js
│   ├── controllers/
│   ├── cron/
│   ├── db/
│   ├── emails/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   └── app.js
│
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server.js
```


## Authentication Flow

- Users can register/login using email & password
- Google OAuth login is supported
- On successful login:
  - A **JWT token** is generated
  - Token is used to access protected routes
- Protected routes require authentication via:
  - HTTP-only cookies OR
  - Authorization headers (Bearer token)


## Environment Variables

Create a `.env` file in the root directory and add the following:

PORT=3000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

OTP_EXPIRY_MINUTES=5

SPOONACULAR_API_KEY=your_spoonacular_api_key
GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_email_address
EMAIL_APP_PASSWORD=your_email_app_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri

NODE_ENV=production
AI_ENABLED=false

⚠️ Do not commit your `.env` file to version control.  


## Steps to Run Project Locally

1️⃣ Clone the repository
```bash
git clone https://github.com/shabbir916/FOODSENTRY-express.js-node.js-mongodb-
cd FOODSENTRY
```

2️⃣ Install dependencies
```bash
npm install
```

3️⃣ Start the server
```bash
npx nodemon server.js
```

Server will start at: http://localhost:3000


## Background Jobs & Notifications
FOODSENTRY uses background jobs to send email notifications for pantry items that are about to expire.
Currently,the expiry notification can be triggered manually using the following command:
```bash
node src/jobs/index.js
```

## Key API Endpoints 
All APIs are prefixed with /api unless stated otherwise.
Protected routes require a valid JWT token in the Authorization header.

Authentication & Authorization

| Method | Endpoint                | Description                       |
| ------ | ----------------------- | --------------------------------- |
| POST   | `/api/auth/register`    | Register a new user               |
| POST   | `/api/auth/login`       | User login using email & password |
| POST   | `/api/auth/logout`      | Logout authenticated user         |
| POST   | `/api/auth/verify-otp`  | Verify OTP                        |
| GET    | `/auth/google`          | Google OAuth login                |
| GET    | `/auth/google/callback` | Google OAuth callback             |

User Management

| Method | Endpoint                   | Description                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/api/user/user-profile`   | Get logged-in user profile *(Protected)* |
| PATCH  | `/api/user/update-profile` | Update user profile *(Protected)*        |

Pantry Management

| Method | Endpoint                       | Description                        |
| ------ | ------------------------------ | ---------------------------------- |
| GET    | `/api/pantry/get-item`         | Get all pantry items *(Protected)* |
| POST   | `/api/pantry/add-item`         | Add item to pantry *(Protected)*   |
| PUT    | `/api/pantry/update-item/:id`  | Update pantry item *(Protected)*   |
| DELETE | `/api/pantry/delete-item/:id`  | Delete pantry item *(Protected)*   |

Recipes Suggestions

| Method | Endpoint                  | Description                                                |
| ------ | ------------------------- | ---------------------------------------------------------- |
| GET    | `/api/recipe/suggestions` | Get recipe suggestions based on pantry items *(Protected)* |











