# Full Stack Application

A full-stack application built with Angular, Node.js, Express, MongoDB, and MySQL.

## Project Structure

```text
.
├── frontend/     # Angular Application
├── server/       # Node.js Backend API
└── README.md
```

## Tech Stack

### Frontend
- Angular
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Databases
- MongoDB (Products)
- MySQL (Users Authentication)

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### Backend Setup

```bash
cd server
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

## Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=app_db
```

## Features

- User Registration
- User Login
- Product Management
- MongoDB Integration
- MySQL Integration
- REST APIs
- Angular Admin Dashboard

## API Endpoints

### Users

- POST /api/users/register
- POST /api/users/login

### Products

- GET /api/products
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

## Author

Ashutosh Kumar