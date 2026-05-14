# Quick Start Guide

## What Has Been Created

You now have a complete full-stack booking system for Christmas market stands. Here's what's included:

### 📁 Project Structure
- **backend/** - Express.js API server with PostgreSQL database
- **frontend/** - React single-page application
- **README.md** - Full documentation
- **.github/copilot-instructions.md** - Development guidelines

### ✨ Key Components

#### Frontend Features
1. **Authentication Page** - Register and login for vendors
2. **Booking Grid** - Interactive grid to select stands (like cinema seats)
3. **Stand Details** - View price, size, and location
4. **Admin Dashboard** - Statistics and booking overview
5. **Responsive Design** - Works on desktop and mobile

#### Backend Features
1. **User Management** - Registration and authentication with JWT
2. **Stand Management** - CRUD operations for stands
3. **Booking System** - Create, view, and cancel bookings
4. **PostgreSQL Database** - Persistent data storage

## Step-by-Step Setup

### 1. Install PostgreSQL
Download from https://www.postgresql.org/download/windows/

### 2. Create Database
Open pgAdmin or psql and run:
```sql
CREATE DATABASE engestofte_booking;
```

### 3. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with your database credentials
# Update the values in .env file

# Run database migrations
npm run migrate

# Start the backend server
npm run dev
```

✅ Backend will be running on http://localhost:5000

### 4. Setup Frontend (in a new terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend
npm start
```

✅ Frontend will open at http://localhost:3000

### 5. Test the Application

1. Go to http://localhost:3000
2. Click "Register" and create a vendor account
3. Log in with your credentials
4. Click on stands to see details
5. Click "Book This Stand" to book
6. View your bookings and admin dashboard

## Important Configuration

### .env File
Update `backend/.env` with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=engestofte_booking
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=any_secret_key_here
PORT=5000
```

### API Base URL
If your backend runs on a different port, update `API_BASE` in:
- `frontend/src/App.js` (line: `const API_BASE = 'http://localhost:5000/api';`)

## Available Scripts

### Backend
```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm run migrate  # Run database migrations
```

### Frontend
```bash
npm start        # Start development server
npm build        # Build for production
npm test         # Run tests
```

## Database Initialization

After running `npm run migrate`, the following tables are created:
- **users** - Vendor accounts
- **events** - Christmas market events
- **stands** - Individual stands/stalls
- **bookings** - Booking records

### First Admin User
To make someone an admin, update their record in PostgreSQL:
```sql
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
```

## Features Overview

### 🎯 Stand Selection (Cinema-Style)
- Visual grid layout with rows (A, B, C...) and columns (1, 2, 3...)
- Click any green stand to see details
- Book available stands instantly

### 📋 Booking Management
- View your active bookings
- Cancel bookings anytime
- See stand price and location

### 📊 Admin Dashboard
- Total stands count
- Booked vs available stands
- Revenue calculation
- Recent bookings list

## Next Steps

1. **Customize Colors** - Edit `.css` files in `frontend/src/components/`
2. **Add More Stands** - Insert into database or create admin panel
3. **Enable Payments** - Integrate Stripe or similar service
4. **Deploy** - Use Heroku, AWS, or DigitalOcean

## Troubleshooting

### Port 3000 or 5000 already in use?
```bash
# Windows - Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Database connection error?
- Verify PostgreSQL is running
- Check credentials in `.env` file
- Ensure database `engestofte_booking` exists

### CORS errors?
- Ensure backend is running on port 5000
- Update `API_BASE` in `frontend/src/App.js` if using different port

## Support Files

- **README.md** - Complete documentation
- **.github/copilot-instructions.md** - Development guidelines
- **backend/.env.example** - Environment variable template

## Need Help?

Check the following files for more information:
1. **README.md** - API endpoints and database schema
2. **.github/copilot-instructions.md** - Development tips
3. Component files have inline comments

Enjoy building your Christmas market booking system! 🎄
