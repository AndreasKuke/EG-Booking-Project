import React, { useState } from 'react';
import './MapBooking.css';

function MapBooking({ stands, bookings, onBookStand, onCancelBooking, userBookings }) {
  const [selectedStand, setSelectedStand] = useState(null);

  const isStandBooked = (standId) => {
    return bookings.some(b => b.stand_id === standId && b.status === 'confirmed');
  };

  const isUserBooked = (standId) => {
    return userBookings.some(b => b.stand_id === standId);
  };

  const getStandStatus = (stand) => {
    if (isStandBooked(stand.id)) {
      if (isUserBooked(stand.id)) return 'user-booked';
      return 'booked';
    }
    return 'available';
  };

  // Group stands by zones
  const standsByZone = {
    main: stands.filter(s => s.row <= 2),
    vintage: stands.filter(s => s.row > 2 && s.row <= 4),
    garden: stands.filter(s => s.row > 4)
  };

  return (
    <div className="map-booking-container">
      <div className="map-section">
        <h2>Select Your Stand</h2>
        <div className="map-canvas">
          {/* Main Market Area */}
          <div className="map-zone main-zone">
            <div className="zone-label">Main Market Square</div>
            <div className="stands-grid main-stands">
              {standsByZone.main.map(stand => (
                <button
                  key={stand.id}
                  className={`map-stand ${getStandStatus(stand)}`}
                  onClick={() => setSelectedStand(stand)}
                  title={`Stand ${stand.id}`}
                >
                  <div className="stand-label">{stand.id}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Vintage/Heritage Area */}
          <div className="map-zone vintage-zone">
            <div className="zone-label">Heritage Courtyard</div>
            <div className="stands-grid vintage-stands">
              {standsByZone.vintage.map(stand => (
                <button
                  key={stand.id}
                  className={`map-stand ${getStandStatus(stand)}`}
                  onClick={() => setSelectedStand(stand)}
                  title={`Stand ${stand.id}`}
                >
                  <div className="stand-label">{stand.id}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Garden Area */}
          <div className="map-zone garden-zone">
            <div className="zone-label">Garden Grove</div>
            <div className="stands-grid garden-stands">
              {standsByZone.garden.map(stand => (
                <button
                  key={stand.id}
                  className={`map-stand ${getStandStatus(stand)}`}
                  onClick={() => setSelectedStand(stand)}
                  title={`Stand ${stand.id}`}
                >
                  <div className="stand-label">{stand.id}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-color available"></div> Available
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div> Booked
          </div>
          <div className="legend-item">
            <div className="legend-color user-booked"></div> Your Booking
          </div>
        </div>
      </div>

      <div className="details-section">
        {selectedStand ? (
          <div className="stand-details">
            <h3>Stand Details</h3>
            <div className="detail-row">
              <span className="label">Stand ID:</span>
              <span className="value">{selectedStand.id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Size:</span>
              <span className="value">{selectedStand.size} m²</span>
            </div>
            <div className="detail-row">
              <span className="label">Price:</span>
              <span className="value">DKK {parseFloat(selectedStand.price).toFixed(2)}</span>
            </div>
            {selectedStand.description && (
              <div className="detail-row">
                <span className="label">Description:</span>
                <span className="value">{selectedStand.description}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className={`value status-${getStandStatus(selectedStand)}`}>
                {isUserBooked(selectedStand.id) ? 'Your Booking' : isStandBooked(selectedStand.id) ? 'Booked' : 'Available'}
              </span>
            </div>

            {isUserBooked(selectedStand.id) ? (
              <button 
                className="btn btn-cancel"
                onClick={() => {
                  const booking = bookings.find(b => b.stand_id === selectedStand.id);
                  onCancelBooking(booking.id);
                  setSelectedStand(null);
                }}
              >
                Cancel Booking
              </button>
            ) : !isStandBooked(selectedStand.id) ? (
              <button 
                className="btn btn-book"
                onClick={() => {
                  onBookStand(selectedStand.id);
                  setSelectedStand(null);
                }}
              >
                Book This Stand
              </button>
            ) : null}
          </div>
        ) : (
          <div className="no-selection">
            <p>Select a stand to view details and book</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapBooking;
