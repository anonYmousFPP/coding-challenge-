# Snapify – API-Driven Photo Gallery

Snapify is a secure image-sharing backend for photo uploads and metadata management, built with Node.js, PostgreSQL, and Cloudinary. It features user authentication, photo management, and admin reporting via modular APIs, emphasizing clean code and documentation.

## Tech Stack

- Node.js + Express
- PostgreSQL + Sequelize
- Cloudinary
- JWT
- Winston/Morgan

## Features

- **User**: Register (`POST /auth/signup`), login (`POST /auth/login`), profile (`GET /me`)
- **Photo**: Upload (`POST /photos/upload`), list with pagination (`GET /photos`), view (`GET /photos/:id`), delete (`DELETE /photos/:id`)
- **Admin**: Stats (`GET /admin/stats`)
- **Metadata**: Stores file name, size, path, caption, user ID

## Setup

1. Clone: `git clone https://github.com/anonYmousFPP/coding-challenge-.git`
2. Install: `npm install`
3. Create `.env` from `.env.example`
4. Run: `npm start`

## .env.example

```plaintext

# Server
PORT=PORT_NUMBER
JWT_SECRET=SECRET_KEY

# Database
DB_NAME=YOUR_DB_NAME
DB_USER=YOUR_USER_NAME
DB_PASS=YOUR_DB_PASSWORD
DB_HOST=DB_HOST
DB_SCHEMA=PUBLIC

# Cloudinary
CLOUDINARY_CLOUD_NAME=CLOUDINARY_NAME
CLOUDINARY_API_KEY=CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=CLOUDINARY_API_SECRET
```

Copy into `.env` and update values.

## Guidelines

- Modular structure (`api/`, `middleware/`, `docs`, `schema`, `util`, `validators` etc.)
- Use `.env`, bcrypt, Joi
- CamelCase, 2-space indentation
- Swagger included

## GitHub

- Push with `.gitignore` (excludes `node_modules`, `.env`)
- Avoid hardcoded secrets, monolithic code
