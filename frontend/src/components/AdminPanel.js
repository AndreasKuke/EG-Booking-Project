import React, { useState } from 'react';
import './AdminPanel.css';

function getStandLocation(id) {
  if (id <= 18) return 'Venstre Bygning';
  if (id <= 36) return 'Højre Bygning';
  if (id <= 54) return 'Nedre Bygning';
  return 'Gårdsplads';
}

function AdminPanel({ stands, bookings, submissions, onAcceptSubmission, onAssignStand, onRefresh }) {
  const [assignInputs, setAssignInputs]   = useState({});
  const [showAssignFor, setShowAssignFor] = useState(null);

  const confirmed  = bookings.filter(b => b.status === 'confirmed');
  const pending    = submissions.filter(s => s.status === 'pending');
  const awaiting   = submissions.filter(s => s.status === 'awaiting_confirmation');
  const actionable = submissions.filter(s => s.status === 'pending' || s.status === 'awaiting_confirmation');

  const isStandTaken = (standId) =>
    bookings.some(b => b.stand_id === standId && b.status === 'confirmed') ||
    submissions.some(s => s.status === 'awaiting_confirmation' && s.assignedStand === standId);

  const handleAssignClick = (submissionId) => {
    const standId = parseInt(assignInputs[submissionId]);
    if (!standId || standId < 1 || standId > 90) return;
    onAssignStand(submissionId, standId);
    setShowAssignFor(null);
    setAssignInputs(prev => ({ ...prev, [submissionId]: '' }));
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Administrationspanel</h2>
        <button onClick={onRefresh} className="refresh-btn">🔄 Opdater</button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stands.length}</div>
          <div className="stat-label">Stande i alt</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{confirmed.length}</div>
          <div className="stat-label">Bekræftede</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stands.length - confirmed.length}</div>
          <div className="stat-label">Ledige</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pending.length}</div>
          <div className="stat-label">Afventer svar</div>
        </div>
      </div>

      {/* Actionable submissions */}
      <div className="admin-section">
        <h3>
          Indkomne ønsker
          {actionable.length > 0 && <span className="badge">{actionable.length}</span>}
        </h3>

        {actionable.length === 0 ? (
          <p className="empty-msg">Ingen indkomne ønsker.</p>
        ) : (
          <div className="submissions-list">
            {actionable.map(sub => (
              <div key={sub.id} className={`submission-card ${sub.status}`}>

                <div className="sub-header">
                  <div>
                    <div className="sub-name">{sub.name}</div>
                    <div className="sub-meta">{sub.company}{sub.phone ? ` · ${sub.phone}` : ''}</div>
                    <div className="sub-meta">{sub.email}</div>
                    {sub.description && <div className="sub-desc">"{sub.description}"</div>}
                  </div>
                  <div className="sub-header-right">
                    <div className={`sub-status-badge ${sub.status}`}>
                      {sub.status === 'pending'               ? 'Afventer'
                       : sub.status === 'awaiting_confirmation' ? 'Afventer bruger'
                       : 'Accepteret'}
                    </div>
                    {sub.userDeclined && (
                      <div className="declined-note">Bruger afslog sidst</div>
                    )}
                  </div>
                </div>

                <div className="sub-date">
                  {new Date(sub.submittedAt).toLocaleDateString('da-DK', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>

                {/* Preferred stands */}
                <div className="sub-prefs">
                  {sub.preferences.map(pref => {
                    const taken      = isStandTaken(pref.standId);
                    const isAssigned = sub.assignedStand === pref.standId;
                    return (
                      <div key={pref.rank} className={`sub-pref-row ${taken ? 'taken' : 'available'} ${isAssigned ? 'assigned' : ''}`}>
                        <div className="sub-pref-info">
                          <span className="sub-rank">{pref.rank}. valg</span>
                          <span className="sub-stand">Stand {pref.standId}</span>
                          <span className="sub-loc">{getStandLocation(pref.standId)}</span>
                        </div>
                        <div className="sub-pref-action">
                          {isAssigned ? (
                            <span className="assigned-label">Foreslået ✓</span>
                          ) : taken ? (
                            <span className="taken-label">Optaget</span>
                          ) : sub.status === 'pending' ? (
                            <button className="accept-btn" onClick={() => onAcceptSubmission(sub.id, pref.standId)}>
                              Accepter
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Awaiting-confirmation info */}
                {sub.status === 'awaiting_confirmation' && (
                  <div className="awaiting-info">
                    Foreslået stand {sub.assignedStand} ({getStandLocation(sub.assignedStand)}) — afventer brugerens svar
                  </div>
                )}

                {/* Assign a different stand */}
                {sub.status === 'pending' && (
                  <div className="assign-section">
                    {showAssignFor === sub.id ? (
                      <div className="assign-form">
                        <label>Foreslå anden stand (nr. 1–90):</label>
                        <div className="assign-form-row">
                          <input
                            type="number"
                            min="1"
                            max="90"
                            placeholder="Stand nr."
                            value={assignInputs[sub.id] || ''}
                            onChange={e =>
                              setAssignInputs(prev => ({ ...prev, [sub.id]: e.target.value }))
                            }
                            onKeyDown={e => e.key === 'Enter' && handleAssignClick(sub.id)}
                          />
                          <button
                            className="assign-confirm-btn"
                            disabled={!assignInputs[sub.id]}
                            onClick={() => handleAssignClick(sub.id)}
                          >
                            Send forslag
                          </button>
                          <button className="assign-cancel-btn" onClick={() => setShowAssignFor(null)}>
                            Annuller
                          </button>
                        </div>
                        {assignInputs[sub.id] && isStandTaken(parseInt(assignInputs[sub.id])) && (
                          <p className="assign-warning">Stand {assignInputs[sub.id]} er allerede optaget eller foreslået.</p>
                        )}
                      </div>
                    ) : (
                      <button className="assign-other-btn" onClick={() => setShowAssignFor(sub.id)}>
                        + Foreslå anden stand
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed bookings table */}
      <div className="admin-section">
        <h3>Bekræftede bookinger</h3>
        {confirmed.length === 0 ? (
          <p className="empty-msg">Ingen bekræftede bookinger endnu.</p>
        ) : (
          <div className="bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Stand</th>
                  <th>Placering</th>
                  <th>E-mail</th>
                  <th>Pris</th>
                  <th>Dato</th>
                </tr>
              </thead>
              <tbody>
                {confirmed.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.stand_id}</td>
                    <td>{getStandLocation(booking.stand_id)}</td>
                    <td>{booking.email}</td>
                    <td>DKK {parseFloat(booking.price).toFixed(0)}</td>
                    <td>{new Date(booking.created_at).toLocaleDateString('da-DK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
