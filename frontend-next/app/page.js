'use client';
import { useBooking } from '../context/BookingContext';
import BlueprintBooking from '../components/BlueprintBooking';

export default function BookingPage() {
  const {
    stands,
    bookings,
    userPreferences,
    preferencesSubmitted,
    handleAddPreference,
    handleRemovePreference,
    handleSubmitPreferences,
    handleResetPreferences,
  } = useBooking();

  return (
    <BlueprintBooking
      stands={stands}
      bookings={bookings}
      userPreferences={userPreferences}
      preferencesSubmitted={preferencesSubmitted}
      onAddPreference={handleAddPreference}
      onRemovePreference={handleRemovePreference}
      onSubmitPreferences={handleSubmitPreferences}
      onResetPreferences={handleResetPreferences}
    />
  );
}
