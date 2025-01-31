# Finexo Assignment

## Overview
This project consists of a frontend built with React, Material UI, and Tailwind CSS, and a backend developed using Node.js, Express, TypeScript, MongoDB (Mongoose), Redis, and ExcelJS. The backend also includes a Redis rate limiter to manage API requests efficiently.

## Technologies Used

### Frontend
- React
- Material UI
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- Redis
- Multer
- ExcelJS (for handling Excel files)
- PM2 (for process management)

## Installation & Setup

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables (`.env` file):
   ```ini
   MONGO_URL=your_mongodb_connection_string
   redisUrl=your_redis_connection_string
   PORT=your_server_port
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```
5. To build the backend for production:
   ```sh
   npm run build
   ```

## API Endpoints

### 1. Import Data
- **Route:** `/import`
- **Method:** `POST`
- **Description:** Handles data import functionality.
- **Rate Limiting:** Implemented using Redis.

### 2. Upload Data
- **Route:** `/upload`
- **Method:** `POST`
- **Description:** Handles file uploads.
- **Rate Limiting:** Implemented using Redis.

## Deployment with PM2
For running the backend in production mode using PM2:
```sh
npm run build
npm run start
```

## Repository Link
[GitHub Repository](https://github.com/SagarKapoorin/Finexo-Assignment)

