'use client';
import React, { useState } from 'react';
import './AdminPanel.css';

function getStandLocation(id) {
  if (id <= 18) return 'Venstre Bygning';
  if (id <= 36) return 'Højre Bygning';
  if (id <= 54) return 'Nedre Bygning';
  return 'Gårdsplads';
}

function getStandType(id) {
  return id <= 54 ? 'Indendørs' : 'Udendørs';
}

function getFurnitureSummary(tableCount, chairCount) {
  const tables = Number(tableCount) || 0;
  const chairs = Number(chairCount) || 0;
  const lines = [];

  if (tables > 0) lines.push(`Borde: ${tables} x 155 kr. = ${tables * 155} kr.`);
  if (chairs > 0) lines.push(`Stole: ${chairs} x 45 kr. = ${chairs * 45} kr.`);
  if (lines.length > 0) lines.push(`Tilvalg i alt: ${tables * 155 + chairs * 45} kr.`);

  return lines.length > 0 ? `\n${lines.join('\n')}` : '';
}

function AdminPanel({ stands, bookings, submissions, onAcceptSubmission, onAssignStand, onRefresh }) {
  const [assignInputs, setAssignInputs]   = useState({});
  const [showAssignFor, setShowAssignFor] = useState(null);
  const [emailModal, setEmailModal]       = useState(null);
  const [sendStatus, setSendStatus]       = useState(null);

  const confirmed  = bookings.filter(b => b.status === 'confirmed');
  const pending    = submissions.filter(s => s.status === 'pending');
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

  const handleAcceptClick = async (sub, standId) => {
    const choiceRank = sub.preferences.find(p => p.standId === standId)?.rank ?? 1;
    const stand = stands.find(s => s.id === standId);

    setEmailModal({
      sub,
      standId,
      draft: '',
      subject: '',
      loading: true,
    });
    setSendStatus(null);

    try {
      const res = await fetch('/api/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName:    sub.name,
          companyName:   sub.company,
          vendorEmail:   sub.email,
          description:   sub.description,
          standId,
          standLocation: getStandLocation(standId),
          standType:     stand?.description || getStandType(standId),
          price:         stand?.priceLabel || `DKK ${stand?.price || '0.00'}`,
          tableCount:    sub.tableCount,
          chairCount:    sub.chairCount,
          choiceRank,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.subject?.trim() || !data.draft?.trim()) {
        throw new Error(data.error || 'Email draft response was empty');
      }
      setEmailModal(prev => ({ ...prev, draft: data.draft, subject: data.subject, loading: false }));
    } catch {
      setEmailModal(prev => ({
        ...prev,
        subject: `Din standplads til Engestofte Julemarked - Stand ${standId}`,
        draft: `Kære ${sub.name || sub.company || 'udstiller'},\n\nVi kan med glæde bekræfte, at I har fået tildelt stand ${standId} til Engestofte Julemarked.\n\nStandpris: ${stand?.priceLabel || `DKK ${stand?.price || '0.00'}`}${getFurnitureSummary(sub.tableCount, sub.chairCount)}\n\nI modtager yderligere information om betaling og opstillingsdato snarest.\n\nVenlig hilsen,\nEngestofte Julemarked`,
        loading: false,
      }));
    }
  };

  const handleSendAndConfirm = async () => {
    setSendStatus('sending');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:      emailModal.sub.email,
          subject: emailModal.subject.trim(),
          body:    emailModal.draft.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSendStatus('sent');
      onAcceptSubmission(emailModal.sub.id, emailModal.standId);
      setTimeout(() => setEmailModal(null), 1500);
    } catch {
      setSendStatus('error');
    }
  };

  const handleConfirmWithoutEmail = () => {
    onAcceptSubmission(emailModal.sub.id, emailModal.standId);
    setEmailModal(null);
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Administrationspanel</h2>
        <button onClick={onRefresh} className="refresh-btn">🔄 Opdater</button>
      </div>

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
                    {sub.description && <div className="sub-desc">&quot;{sub.description}&quot;</div>}
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
                            <button className="accept-btn" onClick={() => handleAcceptClick(sub, pref.standId)}>
                              Accepter
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {sub.status === 'awaiting_confirmation' && (
                  <div className="awaiting-info">
                    Foreslået stand {sub.assignedStand} ({getStandLocation(sub.assignedStand)}) — afventer brugerens svar
                  </div>
                )}

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

      {/* Email preview modal */}
      {emailModal && (
        <div className="email-modal-overlay" onClick={() => !emailModal.loading && setEmailModal(null)}>
          <div className="email-modal" onClick={e => e.stopPropagation()}>
            <div className="email-modal-header">
              <div>
                <h3>E-mail til {emailModal.sub.name}</h3>
                <p className="email-modal-to">Til: {emailModal.sub.email}</p>
              </div>
              {!emailModal.loading && (
                <button className="email-modal-close" onClick={() => setEmailModal(null)}>×</button>
              )}
            </div>

            {emailModal.loading ? (
              <div className="email-modal-loading">
                <div className="email-loading-spinner" />
                <p>Genererer e-mail udkast...</p>
              </div>
            ) : (
              <>
                <div className="email-modal-subject">
                  <label>Emne</label>
                  <input
                    type="text"
                    value={emailModal.subject}
                    onChange={e => setEmailModal(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                <div className="email-modal-body">
                  <label>E-mail tekst</label>
                  <textarea
                    value={emailModal.draft}
                    onChange={e => setEmailModal(prev => ({ ...prev, draft: e.target.value }))}
                    rows={12}
                  />
                </div>

                {sendStatus === 'error' && (
                  <p className="email-send-error">Kunne ikke sende e-mailen. Prøv igen.</p>
                )}
                {sendStatus === 'sent' && (
                  <p className="email-send-success">E-mail sendt! Booking bekræftet.</p>
                )}

                <div className="email-modal-actions">
                  <button
                    className="email-send-btn"
                    onClick={handleSendAndConfirm}
                    disabled={sendStatus === 'sending' || sendStatus === 'sent' || !emailModal.subject.trim() || !emailModal.draft.trim()}
                  >
                    {sendStatus === 'sending' ? 'Sender...' : 'Send & Bekræft'}
                  </button>
                  <button
                    className="email-skip-btn"
                    onClick={handleConfirmWithoutEmail}
                    disabled={sendStatus === 'sending' || sendStatus === 'sent'}
                  >
                    Bekræft uden mail
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
