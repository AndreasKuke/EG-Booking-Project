'use client';
import { createContext, useContext, useState } from 'react';

const STAND_TYPES = {
  A: { size: 12, price: '985.00', priceLabel: 'kr 985,- + moms', description: 'Udendørsstand 3 x 4 m uden elektricitet' },
  B: { size: 9, price: '1685.00', priceLabel: 'kr 1.685,- + moms', description: 'Kostalden langside 3 x 3 m med elektricitet' },
  C: { size: 9, price: '1895.00', priceLabel: 'kr 1.895,- + moms', description: 'Kostalden center 3 x 3 m med elektricitet' },
  D: { size: 10.9, price: '1635.00', priceLabel: 'kr 1.635,- + moms', description: 'Hestestalden ca. 3,3 x 3,3 m med elektricitet' },
  E: { size: 7.5, price: '1695.00', priceLabel: 'kr 1.695,- + moms', description: 'Laden langside 3 x 2,5 m med elektricitet' },
  F: { size: 7.5, price: '1775.00', priceLabel: 'kr 1.775,- + moms', description: 'Laden center 3 x 2,5 m med elektricitet' },
  G: { size: 7.5, price: '1995.00', priceLabel: 'kr 1.995,- + moms', description: 'Laden center/hjørnestand 3 x 2,5 m med elektricitet' },
  H: { size: 5.4, price: '1325.00', priceLabel: 'kr 1.325,- + moms', description: 'Jagtstuen langside 3 x 1,8 m med elektricitet' },
};

function getStandTypeCode(id) {
  if (id >= 98) return 'A';
  if (id <= 11) return 'D';
  if (id <= 57) return [37, 38, 39, 40, 41, 42].includes(id) ? 'C' : 'B';
  if (id <= 63) return 'H';
  if ([80, 81, 82, 83, 84, 85, 86, 87, 89, 90].includes(id)) return 'G';
  if ([74, 75, 76, 77, 78, 79, 88].includes(id)) return 'F';
  return 'E';
}

const MOCK_STANDS = Array.from({ length: 109 }, (_, i) => {
  const id = i + 1;
  const typeCode = getStandTypeCode(id);
  const type = STAND_TYPES[typeCode];
  return {
  id,
  event_id: 1,
  row: Math.floor(i / 10),
  col: i % 10,
  size: type.size,
  price: type.price,
  priceLabel: type.priceLabel,
  standType: typeCode,
  description: type.description,
  status: 'available',
  };
});

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
      ...formData,
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
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
    const stand = stands.find(s => s.id === standId);
    setBookings(prev => [...prev, {
      id: Date.now(),
      stand_id: standId,
      event_id: 1,
      status: 'confirmed',
      email: sub.email,
      company_name: sub.company,
      price: stand?.price || '0.00',
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
    const stand = stands.find(s => s.id === sub.assignedStand);
    setBookings(prev => [...prev, {
      id: Date.now(),
      stand_id: sub.assignedStand,
      event_id: 1,
      status: 'confirmed',
      email: sub.email,
      company_name: sub.company,
      price: stand?.price || '0.00',
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
