import React, { useState } from 'react';
import './BlueprintBooking.css';

const PREF_COLORS = {
  1: { fill: '#FFD700', stroke: '#A07800' },
  2: { fill: '#FF8C42', stroke: '#B05000' },
  3: { fill: '#82C4E8', stroke: '#2A7FAA' },
};

const RANK_LABEL = { 1: '1.', 2: '2.', 3: '3.' };
const RANK_FULL  = { 1: '1. valg', 2: '2. valg', 3: '3. valg' };

function getStandLocation(id) {
  if (id <= 18) return 'Venstre Bygning · Indendørs';
  if (id <= 36) return 'Højre Bygning · Indendørs';
  if (id <= 54) return 'Nedre Bygning · Indendørs';
  return 'Gårdsplads · Udendørs';
}

function BlueprintBooking({
  stands, bookings,
  userPreferences, onAddPreference, onRemovePreference,
  onSubmitPreferences, onResetPreferences, preferencesSubmitted,
}) {
  const [selectedStand, setSelectedStand] = useState(null);
  const [email, setEmail] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', phone: '', description: '' });

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isFormValid  = isEmailValid && form.name.trim() && form.company.trim();

  const updateForm = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleFinalSubmit = () => {
    onSubmitPreferences(email, form);
    setShowDrawer(false);
  };

  const isBooked    = (id) => bookings.some(b => b.stand_id === id && b.status === 'confirmed');
  const getUserPref = (id) => userPreferences.find(p => p.standId === id);

  const getStatus = (stand) => {
    if (isBooked(stand.id)) return 'booked';
    const pref = getUserPref(stand.id);
    if (pref) return `preference-${pref.rank}`;
    return 'available';
  };

  const getCellStyle = (stand) => {
    const status  = getStatus(stand);
    const sel     = selectedStand?.id === stand.id;
    if (status === 'available') return { fill: sel ? '#b2dfdb' : '#e8f5e9', stroke: '#2d5016', sw: sel ? 3 : 1.5 };
    if (status === 'booked')   return { fill: '#d7ccc8', stroke: '#795548', sw: 1.5 };
    const rank = parseInt(status.split('-')[1]);
    const c = PREF_COLORS[rank];
    return { fill: c.fill, stroke: c.stroke, sw: sel ? 3 : 2 };
  };

  const bookedCount    = bookings.filter(b => b.status === 'confirmed').length;
  const availableCount = stands.length - bookedCount;

  const toggleSelected = (stand) =>
    setSelectedStand(prev => prev?.id === stand.id ? null : stand);

  const renderSVG = () => {
    const el = [];

    const grid = (ids, x, y, w, h, cols, bgFill, bgStroke, label) => {
      const rows    = Math.ceil(ids.length / cols);
      const pad     = 10;
      const cellW   = (w - pad * 2) / cols;
      const cellH   = (h - pad * 2) / rows;

      if (bgFill !== 'transparent') {
        el.push(<rect key={`${label}-bg`} x={x} y={y} width={w} height={h} fill={bgFill} stroke={bgStroke} strokeWidth={4} rx={3} />);
        el.push(
          <text key={`${label}-lbl`} x={x + w / 2} y={y - 8}
            fill="#2d5016" fontWeight="700" fontSize={12} textAnchor="middle" fontFamily="Georgia, serif">
            {label}
          </text>
        );
      }

      ids.forEach((id, idx) => {
        const stand = stands.find(s => s.id === id);
        if (!stand) return;
        const col   = idx % cols;
        const row   = Math.floor(idx / cols);
        const cx    = x + pad + col * cellW + cellW / 2;
        const cy    = y + pad + row * cellH + cellH / 2;
        const size  = Math.min(cellW, cellH) - 6;
        const { fill, stroke, sw } = getCellStyle(stand);
        const sel   = selectedStand?.id === id;

        el.push(
          <g key={id} onClick={() => toggleSelected(stand)} style={{ cursor: 'pointer' }}>
            {sel && (
              <rect
                x={cx - size / 2 - 4} y={cy - size / 2 - 4}
                width={size + 8} height={size + 8}
                rx={5} fill="none" stroke="#111" strokeWidth={1.5} opacity={0.35}
              />
            )}
            <rect
              x={cx - size / 2} y={cy - size / 2}
              width={size} height={size}
              rx={3} fill={fill} stroke={stroke} strokeWidth={sw}
            />
            <text x={cx} y={cy + 4} fontSize={10} fontWeight="700" fill={stroke} textAnchor="middle" fontFamily="Georgia, serif">
              {id}
            </text>
          </g>
        );
      });
    };

    // Grass background
    el.push(<rect key="grass" x={0} y={0} width={1000} height={700} fill="#e8f0e0" />);

    // Gravel path between buildings and courtyard
    el.push(<rect key="path-left"   x={190} y={150} width={22} height={385} fill="#d4c9b0" />);
    el.push(<rect key="path-right"  x={788} y={150} width={22} height={385} fill="#d4c9b0" />);
    el.push(<rect key="path-bottom" x={212} y={533} width={576} height={22} fill="#d4c9b0" />);

    // Courtyard
    el.push(
      <rect key="courtyard-bg" x={212} y={150} width={576} height={383}
        fill="#fffbeb" stroke="#c8a820" strokeWidth={4} strokeDasharray="12,5" />
    );
    el.push(
      <text key="courtyard-lbl" x={500} y={166}
        fill="#7a6010" fontWeight="700" fontSize={11} textAnchor="middle" fontFamily="Georgia, serif">
        GÅRDSPLADS · UDENDØRS MARKED
      </text>
    );

    // Buildings
    grid(Array.from({ length: 18 }, (_, i) => i + 1),        52,  150, 138, 383, 3, '#fdf4ea', '#c62828', 'Left Building');
    grid(Array.from({ length: 18 }, (_, i) => i + 19),       810, 150, 138, 383, 3, '#fdf4ea', '#c62828', 'Right Building');
    grid(Array.from({ length: 18 }, (_, i) => i + 37),       212, 555, 576, 110, 6, '#fdf4ea', '#c62828', 'Bottom Building');

    // Courtyard stands — 36 stands, 6×6 grid
    grid(Array.from({ length: 36 }, (_, i) => i + 55),       228, 175, 544, 350, 6, 'transparent', 'transparent', '');

    // North arrow
    el.push(
      <g key="compass" transform="translate(940,50)">
        <circle cx={0} cy={0} r={22} fill="white" stroke="#2d5016" strokeWidth={2} />
        <polygon points="0,-16 5,8 0,4 -5,8" fill="#2d5016" />
        <polygon points="0,16 5,-8 0,-4 -5,-8" fill="#ccc" />
        <text x={0} y={-20} textAnchor="middle" fontSize={11} fontWeight="700" fill="#2d5016" fontFamily="Georgia, serif">N</text>
      </g>
    );

    return el;
  };

  return (
    <div className="blueprint-booking-container">
      {/* Left: map */}
      <div className="blueprint-section">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-num">{stands.length}</span>
            <span className="stat-label">Stande i alt</span>
          </div>
          <div className="stat stat-available">
            <span className="stat-num">{availableCount}</span>
            <span className="stat-label">Ledige</span>
          </div>
          <div className="stat stat-booked">
            <span className="stat-num">{bookedCount}</span>
            <span className="stat-label">Optaget</span>
          </div>
          <div className="stat stat-prefs">
            <span className="stat-num">{userPreferences.length} / 3</span>
            <span className="stat-label">Dine ønsker</span>
          </div>
        </div>

        <div className="blueprint-canvas">
          <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style={{ display: 'block' }}>
            {renderSVG()}
          </svg>
        </div>

        <div className="legend">
          <div className="legend-item"><div className="legend-color available" />Ledig</div>
          <div className="legend-item"><div className="legend-color booked" />Optaget</div>
          <div className="legend-item"><div className="legend-color pref-1" />1. valg</div>
          <div className="legend-item"><div className="legend-color pref-2" />2. valg</div>
          <div className="legend-item"><div className="legend-color pref-3" />3. valg</div>
        </div>
      </div>

      {/* Right: preferences + details */}
      <div className="details-section">
        {preferencesSubmitted ? (
          <div className="submitted-state">
            <div className="submitted-icon">✓</div>
            <h3>Ønsker indsendt</h3>
            <p>Vi gennemgår dine valg og bekræfter din tildelte stand på <strong>{email}</strong>.</p>
            <div className="submitted-list">
              {userPreferences.map(pref => (
                <div key={pref.standId} className={`submitted-row rank-${pref.rank}`}>
                  <span className="submitted-rank">{RANK_LABEL[pref.rank]}</span>
                  <span>Stand {pref.standId} · {getStandLocation(pref.standId)}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-reset" onClick={onResetPreferences}>Start forfra</button>
          </div>
        ) : (
          <>
            <div className="preferences-panel">
              <h3>Standønsker</h3>
              <p className="pref-hint">Vælg op til 3 stande ved at klikke på dem på kortet.</p>

              {[1, 2, 3].map(rank => {
                const pref = userPreferences.find(p => p.rank === rank);
                return (
                  <div key={rank} className={`pref-slot ${pref ? `filled rank-${rank}` : 'empty'}`}>
                    <div className="pref-badge">{RANK_LABEL[rank]}</div>
                    {pref ? (
                      <div className="pref-info">
                        <span className="pref-stand">Stand {pref.standId}</span>
                        <span className="pref-loc">{getStandLocation(pref.standId)}</span>
                      </div>
                    ) : (
                      <span className="pref-empty-text">Klik på en stand på kortet</span>
                    )}
                    {pref && (
                      <button className="pref-remove" onClick={() => {
                        onRemovePreference(pref.standId);
                        if (selectedStand?.id === pref.standId) setSelectedStand(null);
                      }}>×</button>
                    )}
                  </div>
                );
              })}

              <div className="email-section">
                <label className="email-label">Din e-mailadresse</label>
                <input
                  type="email"
                  className={`email-input ${email && !isEmailValid ? 'invalid' : ''}`}
                  placeholder="din@email.dk"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <button
                className="btn btn-submit"
                disabled={userPreferences.length === 0 || !isEmailValid}
                onClick={() => setShowDrawer(true)}
              >
                Fortsæt
              </button>
            </div>

            <div className="stand-detail-panel">
              {selectedStand ? (
                <div className="stand-details">
                  <h4>Stand {selectedStand.id}</h4>

                  <div className="detail-row">
                    <span className="label">Placering</span>
                    <span className="value">{getStandLocation(selectedStand.id)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Type</span>
                    <span className="value">{selectedStand.id <= 54 ? 'Indendørs' : 'Udendørs'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Størrelse</span>
                    <span className="value">{selectedStand.size} m²</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Pris</span>
                    <span className="value">DKK {parseFloat(selectedStand.price).toFixed(0)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status</span>
                    <span className={`value status-${getStatus(selectedStand)}`}>
                      {isBooked(selectedStand.id)
                        ? 'Optaget'
                        : getUserPref(selectedStand.id)
                          ? `Dit ${RANK_FULL[getUserPref(selectedStand.id).rank]}`
                          : 'Ledig'}
                    </span>
                  </div>

                  {isBooked(selectedStand.id) ? (
                    <p className="info-msg taken-msg">Denne stand er allerede tildelt.</p>
                  ) : getUserPref(selectedStand.id) ? (
                    <button className="btn btn-cancel" onClick={() => {
                      onRemovePreference(selectedStand.id);
                      setSelectedStand(null);
                    }}>
                      Fjern fra ønsker
                    </button>
                  ) : userPreferences.length < 3 ? (
                    <button className="btn btn-book" onClick={() => onAddPreference(selectedStand.id)}>
                      Tilføj som {RANK_FULL[userPreferences.length + 1]}
                    </button>
                  ) : (
                    <p className="info-msg">3 ønsker valgt. Fjern et for at tilføje et andet.</p>
                  )}
                </div>
              ) : (
                <div className="no-selection">
                  <p>Vælg en stand for at se detaljer</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom drawer */}
      {showDrawer && (
        <div className="drawer-overlay" onClick={() => setShowDrawer(false)}>
          <div className="bottom-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3>Dine oplysninger</h3>
                <div className="drawer-prefs-summary">
                  {userPreferences.map(pref => (
                    <span key={pref.rank} className={`drawer-pref-chip rank-${pref.rank}`}>
                      {pref.rank}. valg · Stand {pref.standId}
                    </span>
                  ))}
                </div>
              </div>
              <button className="drawer-close" onClick={() => setShowDrawer(false)}>×</button>
            </div>

            <div className="drawer-form">
              <div className="form-field">
                <label>Fulde navn *</label>
                <input
                  type="text"
                  placeholder="Dit fulde navn"
                  value={form.name}
                  onChange={updateForm('name')}
                />
              </div>
              <div className="form-field">
                <label>Virksomhedsnavn *</label>
                <input
                  type="text"
                  placeholder="Navn på din virksomhed"
                  value={form.company}
                  onChange={updateForm('company')}
                />
              </div>
              <div className="form-field">
                <label>Telefonnummer</label>
                <input
                  type="tel"
                  placeholder="+45 00 00 00 00"
                  value={form.phone}
                  onChange={updateForm('phone')}
                />
              </div>
              <div className="form-field">
                <label>Hvad sælger du?</label>
                <input
                  type="text"
                  placeholder="Kort beskrivelse af dine varer"
                  value={form.description}
                  onChange={updateForm('description')}
                />
              </div>
              <div className="form-field form-field-full">
                <button
                  className="btn btn-book drawer-submit"
                  disabled={!isFormValid}
                  onClick={handleFinalSubmit}
                >
                  Indsend {userPreferences.length} ønske{userPreferences.length !== 1 ? 'r' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlueprintBooking;
