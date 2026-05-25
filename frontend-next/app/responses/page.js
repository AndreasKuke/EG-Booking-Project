'use client';
import { useBooking } from '../../context/BookingContext';
import UserResponses from '../../components/UserResponses';

export default function ResponsesPage() {
  const { submissions, handleAcceptOffer, handleDeclineOffer } = useBooking();

  return (
    <UserResponses
      submissions={submissions}
      onAcceptOffer={handleAcceptOffer}
      onDeclineOffer={handleDeclineOffer}
    />
  );
}
