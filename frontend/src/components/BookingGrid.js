import React, { useState } from 'react';
import './BookingGrid.css';

function BookingGrid({ stands, bookings, onBookStand, onCancelBooking, userBookings }) {
  const [selectedStand, setSelectedStand] = useState(null);

  // Get max rows and cols
  const maxRow = Math.max(...stands.map(s => s.row), 0);
  const maxCol = Math.max(...stands.map(s => s.col), 0);

  const getStandAtPosition = (row, col) => {
    return stands.find(s => s.row === row && s.col === col);
  };

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

  return (
    <div className="booking-grid-container">
      <div className="grid-section">
        <h2>Select a Stand</h2>
        <div className="grid-wrapper">
          <div className="booking-grid">
            {Array.from({ length: maxRow + 1 }).map((_, row) => (
              <div key={row} className="grid-row">
                <div className="row-label">{String.fromCharCode(65 + row)}</div>
                {Array.from({ length: maxCol + 1 }).map((_, col) => {
                  const stand = getStandAtPosition(row, col);
                  const status = stand ? getStandStatus(stand) : 'empty';
                  
                  return (
                    <button
                      key={`${row}-${col}`}
                      className={`grid-cell ${status}`}
                      onClick={() => stand && setSelectedStand(stand)}
                      disabled={!stand}
                      title={stand ? `Stand ${stand.id}` : 'No stand'}
                    >
                      {stand && <span className="stand-number">{stand.id}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="col-labels">
            <div></div>
            {Array.from({ length: maxCol + 1 }).map((_, col) => (
              <div key={col} className="col-label">{col + 1}</div>
            ))}
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
              <span className="label">Position:</span>
              <span className="value">
                {String.fromCharCode(65 + selectedStand.row)}{selectedStand.col + 1}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Size:</span>
              <span className="value">{selectedStand.size} units</span>
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
            <p>👈 Select a stand to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingGrid;
