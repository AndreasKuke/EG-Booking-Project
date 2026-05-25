'use client';
import { useBooking } from '../../context/BookingContext';
import AdminPanel from '../../components/AdminPanel';

export default function AdminPage() {
  const {
    stands,
    bookings,
    submissions,
    handleAcceptSubmission,
    handleAssignStand,
    handleRefresh,
  } = useBooking();

  return (
    <AdminPanel
      stands={stands}
      bookings={bookings}
      submissions={submissions}
      onAcceptSubmission={handleAcceptSubmission}
      onAssignStand={handleAssignStand}
      onRefresh={handleRefresh}
    />
  );
}
