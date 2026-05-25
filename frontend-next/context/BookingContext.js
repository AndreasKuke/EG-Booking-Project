'use client';
import { createContext, useContext, useState } from 'react';

const MOCK_STANDS = Array.from({ length: 90 }, (_, i) => ({
  id: i + 1,
  event_id: 1,
  row: Math.floor(i / 10),
  col: i % 10,
  size: 3,
  price: '500.00',
  description: `Stand ${i + 1}`,
  status: 'available',
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

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [stands] = useState(MOCK_STANDS);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [userPreferences, setUserPreferences] = useState([]);
  const [preferencesSubmitted, setPreferencesSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState([]);

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
    <BookingContext.Provider value={{
      stands,
      bookings,
      userPreferences,
      preferencesSubmitted,
      submissions,
      awaitingCount,
      handleAddPreference,
      handleRemovePreference,
      handleSubmitPreferences,
      handleResetPreferences,
      handleAcceptSubmission,
      handleAssignStand,
      handleRefresh,
      handleAcceptOffer,
      handleDeclineOffer,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
