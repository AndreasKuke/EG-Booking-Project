# Christmas Market Stand Booking System

A full-stack web application for booking stands at Christmas markets, similar to cinema seat booking. Built with React, Express.js, and PostgreSQL.

## Features

- 🎯 **Grid-based Stand Selection** - Visual grid interface for selecting stands, similar to cinema seats
- 👤 **User Authentication** - Register and login for vendors
- 📋 **Booking Management** - Book, view, and cancel stand bookings
- 📊 **Admin Dashboard** - View all bookings, revenue statistics, and manage stands
- 🎨 **Responsive Design** - Works on desktop and mobile devices
- 🔐 **Secure** - Password hashing and JWT authentication

## Project Structure

```
Engestofte/
├── frontend/                 # React frontend application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.js       # Login/Register component
│   │   │   ├── Auth.css
│   │   │   ├── BookingGrid.js # Main booking interface
│   │   │   ├── BookingGrid.css
│   │   │   ├── AdminPanel.js  # Admin dashboard
│   │   │   └── AdminPanel.css
│   │   ├── App.js            # Main app component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── backend/                  # Express.js backend API
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── stands.js        # Stand management endpoints
│   │   └── bookings.js      # Booking endpoints
│   ├── scripts/
│   │   └── migrate.js       # Database migration script
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env.example
└── README.md
```

## Tech Stack

### Frontend
- **React 18** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling (no external UI framework for simplicity)

### Backend
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE engestofte_booking;
```

### 2. Backend Setup

```bash
cd backend

# Copy the .env.example to .env and update values
cp .env.example .env

# Install dependencies
npm install

# Run database migration
npm run migrate

# Start the server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

Frontend will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new vendor
- `POST /api/auth/login` - Login a vendor

### Stands
- `GET /api/stands/:eventId` - Get all stands for an event
- `GET /api/stands/:eventId/:standId` - Get a specific stand
- `POST /api/stands` - Create a new stand (admin only)
- `PUT /api/stands/:standId` - Update a stand (admin only)

### Bookings
- `GET /api/bookings/:eventId` - Get all bookings for an event
- `POST /api/bookings` - Create a new booking
- `DELETE /api/bookings/:bookingId` - Cancel a booking

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email
- `password` - Hashed password
- `company_name` - Vendor company name
- `is_admin` - Admin flag
- `created_at` - Timestamp

### Events Table
- `id` - Primary key
- `name` - Event name
- `description` - Event description
- `start_date` - Event start date
- `end_date` - Event end date
- `rows` - Number of rows in grid
- `cols` - Number of columns in grid

### Stands Table
- `id` - Primary key
- `event_id` - Foreign key to events
- `row` - Row position (0-indexed)
- `col` - Column position (0-indexed)
- `size` - Stand size in units
- `price` - Stand price in DKK
- `description` - Stand description
- `status` - Status (available/booked/reserved)

### Bookings Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `stand_id` - Foreign key to stands
- `event_id` - Foreign key to events
- `status` - Booking status (pending/confirmed/cancelled)
- `created_at` - Booking creation timestamp
- `updated_at` - Last update timestamp

## Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=engestofte_booking
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here
```

### Frontend
The frontend uses `http://localhost:5000/api` as the API base URL. Modify `API_BASE` in [App.js](frontend/src/App.js) to change this.

## Usage

1. **Register** - Create a vendor account with email and company name
2. **Login** - Log in with your credentials
3. **Select Stand** - Click on an available stand in the grid
4. **View Details** - See stand price, size, and position
5. **Book** - Click "Book This Stand" to confirm
6. **Admin Panel** - View all bookings and statistics

## Future Enhancements

- [ ] Payment integration
- [ ] Email notifications
- [ ] PDF invoicing
- [ ] Advanced filtering and search
- [ ] Booking modifications
- [ ] Multiple events support in UI
- [ ] Analytics and reporting
- [ ] Map-based stand layout
- [ ] Real-time availability updates

## License

ISC

## Support

For support or questions, please contact the development team.
