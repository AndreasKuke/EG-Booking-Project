import React, { useState } from 'react';
import './App.css';
import BlueprintBooking from './components/BlueprintBooking';
import AdminPanel from './components/AdminPanel';
import UserResponses from './components/UserResponses';

const MOCK_STANDS = Array.from({ length: 90 }, (_, i) => ({
  id: i + 1,
  event_id: 1,
  row: Math.floor(i / 10),
  col: i % 10,
  size: 3,
  price: '500.00',
  description: `Stand ${i + 1}`,
  status: 'available'
}));

const MOCK_BOOKINGS = [
  { id: 1, stand_id: 3,  event_id: 1, status: 'confirmed', email: 'shop@example.com',    company_name: 'Holiday Shop',  price: '500.00', created_at: '2026-05-10' },
  { id: 2, stand_id: 14, event_id: 1, status: 'confirmed', email: 'craft@example.com',   company_name: 'Craft Makers',  price: '500.00', created_at: '2026-05-10' },
  { id: 3, stand_id: 25, event_id: 1, status: 'confirmed', email: 'toys@example.com',    company_name: 'Toy Store',     price: '500.00', created_at: '2026-05-10' },
  { id: 4, stand_id: 40, event_id: 1, status: 'confirmed', email: 'bakery@example.com',  company_name: 'Bakery Stand',  price: '500.00', created_at: '2026-05-10' },
  { id: 5, stand_id: 60, event_id: 1, status: 'confirmed', email: 'candle@example.com',  company_name: 'Candle Maker',  price: '500.00', created_at: '2026-05-10' },
  { id: 6, stand_id: 72, event_id: 1, status: 'confirmed', email: 'wool@example.com',    company_name: 'Wool & Knits',  price: '500.00', created_at: '2026-05-10' },
  { id: 7, stand_id: 85, event_id: 1, status: 'confirmed', email: 'pottery@example.com', company_name: 'Pottery Works', price: '500.00', created_at: '2026-05-10' },
];

function App() {
  const [view, setView] = useState('booking');
  const [stands] = useState(MOCK_STANDS);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [userPreferences, setUserPreferences] = useState([]);
  const [preferencesSubmitted, setPreferencesSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  // ── Preference handlers ────────────────────────────────
  const handleAddPreference = (standId) => {
    if (userPreferences.length >= 3) return;
    if (userPreferences.some(p => p.standId === standId)) return;
    setUserPreferences(prev => [...prev, { standId, rank: prev.length + 1 }]);
  };

  const handleRemovePreference = (standId) => {
    setUserPreferences(prev =>
      prev.filter(p => p.standId !== standId).map((p, i) => ({ ...p, rank: i + 1 }))
    );
  };

  const handleSubmitPreferences = (email, formData) => {
    const newSubmission = {
      id: Date.now(),
      email,
      name:        formData.name,
      company:     formData.company,
      phone:       formData.phone,
      description: formData.description,
      preferences: [...userPreferences],
      status: 'pending',
      assignedStand: null,
      userDeclined: false,
      submittedAt: new Date().toISOString(),
    };
    setSubmissions(prev => [...prev, newSubmission]);
    setPreferencesSubmitted(true);
  };

  const handleResetPreferences = () => {
    setUserPreferences([]);
    setPreferencesSubmitted(false);
  };

  // ── Admin handlers ─────────────────────────────────────
  // Accept one of the user's preferred stands directly → confirmed immediately
  const handleAcceptSubmission = (submissionId, standId) => {
    setSubmissions(prev =>
      prev.map(s => s.id === submissionId ? { ...s, status: 'accepted', assignedStand: standId } : s)
    );
    const sub = submissions.find(s => s.id === submissionId);
    setBookings(prev => [...prev, {
      id: Date.now(),
      stand_id: standId,
      event_id: 1,
      status: 'confirmed',
      email: sub.email,
      company_name: sub.company,
      price: '500.00',
      created_at: new Date().toISOString().split('T')[0],
    }]);
  };

  // Propose a different stand → user must confirm
  const handleAssignStand = (submissionId, standId) => {
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId
          ? { ...s, status: 'awaiting_confirmation', assignedStand: standId, userDeclined: false }
          : s
      )
    );
  };

  const handleRefresh = () =>
    setSubmissions(prev => prev.filter(s => s.status === 'pending' || s.status === 'awaiting_confirmation'));

  // ── User response handlers ─────────────────────────────
  const handleAcceptOffer = (submissionId) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;
    setSubmissions(prev =>
      prev.map(s => s.id === submissionId ? { ...s, status: 'accepted' } : s)
    );
    setBookings(prev => [...prev, {
      id: Date.now(),
      stand_id: sub.assignedStand,
      event_id: 1,
      status: 'confirmed',
      email: sub.email,
      company_name: sub.company,
      price: '500.00',
      created_at: new Date().toISOString().split('T')[0],
    }]);
  };

  const handleDeclineOffer = (submissionId) => {
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId
          ? { ...s, status: 'pending', assignedStand: null, userDeclined: true }
          : s
      )
    );
  };

  const awaitingCount = submissions.filter(s => s.status === 'awaiting_confirmation').length;

  return (
    <div className="App">
      <header className="app-header">
        <h1>E.G. Julemarked</h1>
        <div className="header-controls">
          <button onClick={() => setView('booking')} className={view === 'booking' ? 'active' : ''}>
            Bestil Stand
          </button>
          <button onClick={() => setView('responses')} className={`${view === 'responses' ? 'active' : ''} responses-btn`}>
            Mine svar
            {awaitingCount > 0 && <span className="header-badge">{awaitingCount}</span>}
          </button>
          <button onClick={() => setView('admin')} className={view === 'admin' ? 'active' : ''}>
            Admin
          </button>
        </div>
      </header>

      <main className="app-main">
        {view === 'booking' ? (
          <BlueprintBooking
            stands={stands}
            bookings={bookings}
            userPreferences={userPreferences}
            onAddPreference={handleAddPreference}
            onRemovePreference={handleRemovePreference}
            onSubmitPreferences={handleSubmitPreferences}
            onResetPreferences={handleResetPreferences}
            preferencesSubmitted={preferencesSubmitted}
          />
        ) : view === 'responses' ? (
          <UserResponses
            submissions={submissions}
            onAcceptOffer={handleAcceptOffer}
            onDeclineOffer={handleDeclineOffer}
          />
        ) : (
          <AdminPanel
            stands={stands}
            bookings={bookings}
            submissions={submissions}
            onAcceptSubmission={handleAcceptSubmission}
            onAssignStand={handleAssignStand}
            onRefresh={handleRefresh}
          />
        )}
      </main>
    </div>
  );
}

export default App;
