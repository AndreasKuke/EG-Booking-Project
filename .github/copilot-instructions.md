# GitHub Copilot Instructions - Engestofte Christmas Market Booking System

## Project Overview
This is a full-stack booking system for Christmas market stands, built with React (frontend), Express.js (backend), and PostgreSQL (database).

## Architecture
- **Frontend**: React-based SPA with grid-based stand booking interface
- **Backend**: Express.js REST API with PostgreSQL database
- **Authentication**: JWT-based with password hashing
- **Database**: PostgreSQL with migration scripts

## Key Features
1. Grid-based stand selection (like cinema seats)
2. User authentication (register/login)
3. Stand booking and cancellation
4. Admin dashboard with statistics
5. Responsive design

## Development Workflow

### Before Starting Development
1. Ensure PostgreSQL is running
2. Set up `.env` files in both backend and frontend directories
3. Run database migrations: `npm run migrate` in backend

### Running the Application

#### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev  # Starts on port 5000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start    # Starts on port 3000
```

## Code Style and Conventions

### Frontend (React)
- Use functional components with hooks
- CSS modules or separate CSS files for styling
- Components in `src/components/` folder
- API calls in components (can be refactored to a service layer later)

### Backend (Express)
- Routes organized in `routes/` folder
- Each route file exports a function that takes the pool as parameter
- Database queries use parameterized statements to prevent SQL injection
- Middleware before route definitions

## Common Tasks

### Adding a New API Endpoint
1. Create route handler in appropriate file in `backend/routes/`
2. Use `pool.query()` for database operations
3. Test with Postman or similar tool
4. Update frontend to call the new endpoint

### Adding a New React Component
1. Create `.js` file in `frontend/src/components/`
2. Create corresponding `.css` file
3. Import in parent component
4. Call API from component (use useState/useEffect)

### Modifying Database Schema
1. Update migration script in `backend/scripts/migrate.js`
2. Drop existing database and recreate: `DROP DATABASE engestofte_booking;`
3. Run migration again: `npm run migrate`

## Important Notes

- The current implementation uses eventId = 1 by default (modify in App.js for flexibility)
- CORS is enabled for `http://localhost:3000`
- Modify CORS settings in backend if frontend runs on different port
- Admin functionality currently checks is_admin flag (seed an admin user in database after migration)

## Debugging

### Common Issues

1. **CORS Error**: Update CORS origin in `backend/server.js`
2. **Database Connection Error**: Check `.env` file PostgreSQL credentials
3. **JWT Error**: Ensure `JWT_SECRET` is set in `.env`
4. **Port Already in Use**: Change PORT in `.env` or kill existing process

### Testing API
Use Postman or curl:
```bash
# Test backend health
curl http://localhost:5000/api/health

# Register (POST)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","company_name":"Test Co"}'
```

## Next Steps for Enhancement

1. **Payment Integration** - Add Stripe or similar for payment processing
2. **Email Notifications** - Send confirmation emails on booking
3. **Admin Features** - Implement full admin CRUD operations
4. **Real-time Updates** - Add WebSocket for live availability
5. **Booking Modifications** - Allow vendors to modify bookings
6. **PDF Generation** - Create booking confirmations as PDF

## File Locations Reference

- API Base URL Configuration: `frontend/src/App.js` (API_BASE)
- Database Connection: `backend/server.js`
- Auth Routes: `backend/routes/auth.js`
- Stand Routes: `backend/routes/stands.js`
- Booking Routes: `backend/routes/bookings.js`
- Main UI: `frontend/src/components/BookingGrid.js`
- Admin Dashboard: `frontend/src/components/AdminPanel.js`
