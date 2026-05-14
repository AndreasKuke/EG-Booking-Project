import React from 'react';
import './UserResponses.css';

function getStandLocation(id) {
  if (id <= 18) return 'Venstre Bygning · Indendørs';
  if (id <= 36) return 'Højre Bygning · Indendørs';
  if (id <= 54) return 'Nedre Bygning · Indendørs';
  return 'Gårdsplads · Udendørs';
}

function UserResponses({ submissions, onAcceptOffer, onDeclineOffer }) {
  const awaiting = submissions.filter(s => s.status === 'awaiting_confirmation');
  const accepted = submissions.filter(s => s.status === 'accepted' && s.assignedStand);

  return (
    <div className="user-responses-container">
      <h2>Mine svar</h2>
      <p className="responses-intro">
        Når Engestofte Gods tildeler dig en stand, vises den her. Du kan acceptere tilbuddet eller anmode om et andet sted.
      </p>

      {awaiting.length === 0 && accepted.length === 0 ? (
        <div className="no-offers">
          <div className="no-offers-icon">📭</div>
          <p>Du har ingen afventende tilbud.</p>
        </div>
      ) : (
        <div className="offers-list">
          {awaiting.map(sub => (
            <div key={sub.id} className="offer-card pending-offer">
              <div className="offer-tag">Nyt tilbud — afventer dit svar</div>

              <div className="offer-stand-block">
                <div className="offer-stand-num">Stand {sub.assignedStand}</div>
                <div className="offer-stand-loc">{getStandLocation(sub.assignedStand)}</div>
              </div>

              <div className="offer-original-prefs">
                <span className="offer-prefs-label">Dine oprindelige ønsker:</span>
                <div className="offer-chips">
                  {sub.preferences.map(p => (
                    <span key={p.rank} className="offer-chip">
                      {p.rank}. valg · Stand {p.standId}
                    </span>
                  ))}
                </div>
              </div>

              <div className="offer-actions">
                <button className="btn-accept-offer" onClick={() => onAcceptOffer(sub.id)}>
                  Accepter tilbud
                </button>
                <button className="btn-decline-offer" onClick={() => onDeclineOffer(sub.id)}>
                  Anmod om andet
                </button>
              </div>

              <p className="offer-note">
                Hvis du anmoder om et andet sted, vil Engestofte Gods blive informeret og vende tilbage med et nyt tilbud.
              </p>
            </div>
          ))}

          {accepted.map(sub => (
            <div key={sub.id} className="offer-card accepted-offer">
              <div className="offer-tag accepted-tag">Bekræftet</div>
              <div className="offer-stand-block">
                <div className="offer-stand-num">Stand {sub.assignedStand}</div>
                <div className="offer-stand-loc">{getStandLocation(sub.assignedStand)}</div>
              </div>
              <p className="accepted-msg">Din booking er bekræftet. Du modtager en kvittering på {sub.email}.</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserResponses;
