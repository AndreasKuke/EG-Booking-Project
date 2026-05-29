'use client';
import React, { useMemo, useState } from 'react';
import './BlueprintBooking.css';

const PREF_COLORS = {
  1: { fill: '#FFD700', stroke: '#A07800' },
  2: { fill: '#FF8C42', stroke: '#B05000' },
  3: { fill: '#82C4E8', stroke: '#2A7FAA' },
};

const RANK_LABEL = { 1: '1.', 2: '2.', 3: '3.' };
const RANK_FULL = { 1: '1. valg', 2: '2. valg', 3: '3. valg' };
const STAND_TYPES = [
  { value: 'A', label: 'A: Udendørsstand 3 x 4 m uden elektricitet', price: 'kr 985,- + moms', amount: '985.00' },
  { value: 'B', label: 'B: Indendørsstand langsiden i Kostalden 3 x 3 m', price: 'kr 1.685,- + moms', amount: '1685.00' },
  { value: 'C', label: 'C: Indendørsstand center i Kostalden 3 x 3 m', price: 'kr 1.895,- + moms', amount: '1895.00' },
  { value: 'D', label: 'D: Indendørsstand i Hestestalden ca. 3,3 x 3,3 m', price: 'kr 1.635,- + moms', amount: '1635.00' },
  { value: 'E', label: 'E: Indendørsstand langsiden i Laden 3 x 2,5 m', price: 'kr 1.695,- + moms', amount: '1695.00' },
  { value: 'F', label: 'F: Indendørsstand center i Laden 3 x 2,5 m', price: 'kr 1.775,- + moms', amount: '1775.00' },
  { value: 'G', label: 'G: Indendørsstand center/hjørne i Laden 3 x 2,5 m', price: 'kr 1.995,- + moms', amount: '1995.00' },
  { value: 'H', label: 'H: Indendørsstand langsiden i Jagtstuen 3 x 1,8 m', price: 'kr 1.325,- + moms', amount: '1325.00' },
];

// Pragmatic mapping from the supplied PDFs to the site-map shapes:
// Kostalden has the most booths and is placed in the large lower road building.
// Laden has many booths and is placed in the large right-side building.
// Hestestalden and Jagtstuen are placed in the smaller remaining buildings.
const BUILDINGS = [
  {
    id: 'restaurant',
    name: 'Køkken / restaurant',
    disabled: true,
    note: 'Ingen stande',
    siteShape: 'restaurant',
    siteLabel: { x: 535, y: 150 },
  },
  {
    id: 'outdoor',
    name: 'Udendørs område',
    standIds: range(98, 109),
    siteShape: 'outdoor',
    siteLabel: { x: 470, y: 470 },
    standSize: '3 x 4 m uden elektricitet',
  },
  {
    id: 'hestestalden',
    name: 'Hestestalden',
    pdf: 'Final_Stadeplan_Hestestald 2025.pdf',
    standIds: range(1, 11),
    siteShape: 'left-long',
    siteLabel: { x: 176, y: 318 },
    standSize: 'ca. 3,2 x 3,2 m',
  },
  {
    id: 'kostalden',
    name: 'Kostalden',
    pdf: 'FINAL_Stadeplan_Kostald 2025.pdf',
    standIds: range(12, 57),
    siteShape: 'bottom-long',
    siteLabel: { x: 395, y: 800 },
    standSize: '3 x 3 m',
  },
  {
    id: 'jagtstuen',
    name: 'Jagtstuen',
    pdf: 'Final_Stadeplan_Jagtstuen2025.pdf',
    standIds: range(58, 63),
    siteShape: 'lower-small',
    siteLabel: { x: 420, y: 1000 },
    standSize: 'mindre indendørs stand',
  },
  {
    id: 'laden',
    name: 'Laden',
    pdf: 'Final_Stadeplan_Laden 2025.pdf',
    standIds: range(64, 97),
    siteShape: 'right-long',
    siteLabel: { x: 780, y: 470 },
    standSize: '2,5 x 3 m',
  },
];

const SITE_ONLY_BUILDINGS = [
  { id: 'top-left-small', name: 'Bygning', disabled: true, siteShape: 'top-left-small', siteLabel: { x: 306, y: 98 } },
  { id: 'left-small', name: 'Bygning', disabled: true, siteShape: 'left-small', siteLabel: { x: 104, y: 500 } },
  { id: 'bottom-small', name: 'Bygning', disabled: true, siteShape: 'bottom-small', siteLabel: { x: 320, y: 855 } },
];

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function getBuildingForStand(id) {
  return BUILDINGS.find(building => building.standIds?.includes(id));
}

function getStandLocation(id) {
  const building = getBuildingForStand(id);
  if (!building) return 'Ukendt placering';
  return building.id === 'outdoor' ? `${building.name} · Udendørs` : `${building.name} · Indendørs`;
}

function getStandType(id) {
  if (id >= 98) return STAND_TYPES.find(type => type.value === 'A');
  if (id <= 11) return STAND_TYPES.find(type => type.value === 'D');
  if (id <= 57) return STAND_TYPES.find(type => type.value === ([37, 38, 39, 40, 41, 42].includes(id) ? 'C' : 'B'));
  if (id <= 63) return STAND_TYPES.find(type => type.value === 'H');
  if ([80, 81, 82, 83, 84, 85, 86, 87, 89, 90].includes(id)) return STAND_TYPES.find(type => type.value === 'G');
  if ([74, 75, 76, 77, 78, 79, 88].includes(id)) return STAND_TYPES.find(type => type.value === 'F');
  return STAND_TYPES.find(type => type.value === 'E');
}

function BlueprintBooking({
  stands, bookings,
  userPreferences, onAddPreference, onRemovePreference,
  onSubmitPreferences, onResetPreferences, preferencesSubmitted,
}) {
  const firstSelectableBuilding = BUILDINGS.find(building => !building.disabled);
  const [activeBuildingId, setActiveBuildingId] = useState(null);
  const [selectedStand, setSelectedStand] = useState(null);
  const [email, setEmail] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    cvr: '',
    address: '',
    postalCity: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    newVendorProducts: '',
    standType: '',
    tableCount: '',
    chairCount: '',
    acceptsTerms: false,
  });

  const activeBuilding = useMemo(
    () => BUILDINGS.find(building => building.id === activeBuildingId),
    [activeBuildingId]
  );
  const visibleBuilding = activeBuilding || firstSelectableBuilding;
  const showingSiteMap = !activeBuilding;

  const applicationEmail = form.email || email;
  const isEmailValid = /\S+@\S+\.\S+/.test(applicationEmail);
  const hasThreePreferences = userPreferences.length === 3;
  const isFormValid =
    isEmailValid &&
    form.name.trim() &&
    form.company.trim() &&
    form.phone.trim() &&
    form.description.trim() &&
    form.standType &&
    form.acceptsTerms;

  const updateForm = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFinalSubmit = () => {
    onSubmitPreferences(applicationEmail, { ...form, email: applicationEmail });
    setShowApplicationForm(false);
  };

  const isBooked = (id) => bookings.some(b => b.stand_id === id && b.status === 'confirmed');
  const getUserPref = (id) => userPreferences.find(p => p.standId === id);
  const getStand = (id) => stands.find(stand => stand.id === id);

  const getStatus = (stand) => {
    if (isBooked(stand.id)) return 'booked';
    const pref = getUserPref(stand.id);
    if (pref) return `preference-${pref.rank}`;
    return 'available';
  };

  const getCellStyle = (stand) => {
    const status = getStatus(stand);
    const sel = selectedStand?.id === stand.id;
    if (status === 'available') return { fill: sel ? '#cce7df' : '#f7fbf2', stroke: '#2d5016', sw: sel ? 3 : 1.4 };
    if (status === 'booked') return { fill: '#d7ccc8', stroke: '#795548', sw: 1.4 };
    const rank = parseInt(status.split('-')[1], 10);
    const c = PREF_COLORS[rank];
    return { fill: c.fill, stroke: c.stroke, sw: sel ? 3 : 2 };
  };

  const bookedCount = bookings.filter(b => b.status === 'confirmed').length;
  const availableCount = stands.length - bookedCount;

  const handleSelectBuilding = (building) => {
    if (building.disabled) return;
    setShowApplicationForm(false);
    setActiveBuildingId(building.id);
    setSelectedStand(null);
  };

  const toggleSelected = (stand) =>
    setSelectedStand(prev => prev?.id === stand.id ? null : stand);

  const renderSiteMap = () => (
    <svg viewBox="0 0 980 1200" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" className="site-map-svg">
      <defs>
        <filter id="map-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity="0.18" />
        </filter>
      </defs>

      <rect x="0" y="0" width="980" height="1200" fill="#d9f2df" />
      <path d="M495 -35 L1215 318" stroke="#b8c7d1" strokeWidth="70" strokeLinecap="round" fill="none" />
      <text x="845" y="155" fill="white" fontSize="34" fontWeight="700" transform="rotate(27 845 155)">Søvej</text>
      <path d="M172 585 L1220 1125" stroke="#b8c7d1" strokeWidth="70" strokeLinecap="round" fill="none" />
      <text x="438" y="748" fill="white" fontSize="32" fontWeight="700" transform="rotate(27 438 748)">Søvej 10</text>
      <path d="M1152 260 L1162 1155" stroke="#b8c7d1" strokeWidth="70" strokeLinecap="round" fill="none" />

      {BUILDINGS.map(building => renderSiteBuilding(building, handleSelectBuilding))}
      {SITE_ONLY_BUILDINGS.map(building => renderSiteBuilding(building, handleSelectBuilding))}

      <g transform="translate(497 133)" filter="url(#map-shadow)">
        <circle r="24" fill="#ff7f2a" stroke="white" strokeWidth="5" />
        <text x="0" y="8" textAnchor="middle" fontSize="23" fill="white" fontWeight="700">🍴</text>
      </g>
    </svg>
  );

  const renderBuildingPlan = () => {
    if (visibleBuilding.id === 'hestestalden') return renderHestestalden();
    if (visibleBuilding.id === 'kostalden') return renderKostalden();
    if (visibleBuilding.id === 'jagtstuen') return renderJagtstuen();
    if (visibleBuilding.id === 'outdoor') return renderOutdoorArea();
    return renderLaden();
  };

  const renderBooth = (id, x, y, w, h, label = id, rotate = 0) => {
    const stand = getStand(id);
    if (!stand) return null;
    const { fill, stroke, sw } = getCellStyle(stand);
    const pref = getUserPref(id);
    const booked = isBooked(id);

    return (
      <g
        key={id}
        transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}
        onClick={() => !booked && toggleSelected(stand)}
        className={`plan-booth ${booked ? 'is-booked' : ''}`}
        role="button"
        aria-label={`Stand ${id}`}
      >
        <rect x={x} y={y} width={w} height={h} rx="3" fill={fill} stroke={stroke} strokeWidth={sw} />
        <circle cx={x + w / 2} cy={y + h / 2 + 7} r={Math.min(w, h) * 0.18} fill="white" stroke={stroke} strokeWidth="1.5" />
        <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" fontSize="12" fontWeight="700" fill={stroke}>{label}</text>
        {pref && (
          <text x={x + w - 10} y={y + 16} textAnchor="middle" fontSize="13" fontWeight="700" fill={stroke}>{pref.rank}</text>
        )}
      </g>
    );
  };

  const renderExit = (x, y, text = 'IND / UD') => (
    <g key={`${x}-${y}-${text}`}>
      <rect x={x} y={y} width="34" height="34" fill="#5aa33a" stroke="#2d5016" strokeWidth="2" />
      <text x={x + 17} y={y + 22} textAnchor="middle" fill="white" fontSize="18" fontWeight="700">↗</text>
      <text x={x + 17} y={y + 49} textAnchor="middle" fill="#c62828" fontSize="9" fontWeight="700">{text}</text>
    </g>
  );

  const renderCommonPlanShell = (children, width = 1000, height = 520) => (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" width="100%" height="100%" className="floor-plan-svg">
      <defs>
        <pattern id="walkway" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="14" stroke="#58a646" strokeWidth="2" />
        </pattern>
      </defs>
      {children}
    </svg>
  );

  const renderHestestalden = () => renderCommonPlanShell(
    <>
      <rect x="95" y="95" width="810" height="300" fill="#fffdf7" stroke="#222" strokeWidth="8" />
      <rect x="105" y="205" width="790" height="70" fill="url(#walkway)" stroke="#58a646" strokeWidth="2" />
      {renderBooth(1, 125, 110, 120, 90)}
      {renderBooth(2, 300, 110, 130, 90)}
      {renderBooth(3, 435, 110, 130, 90)}
      {renderBooth(4, 570, 110, 130, 90)}
      {renderBooth(5, 705, 110, 130, 90)}
      {renderBooth(6, 125, 280, 120, 95)}
      {renderBooth(7, 300, 280, 130, 95)}
      {renderBooth(8, 435, 280, 130, 95)}
      {renderBooth(9, 570, 280, 130, 95)}
      {renderBooth(10, 705, 280, 130, 95)}
      {renderBooth(11, 250, 280, 45, 95)}
      {renderExit(115, 220, 'NØDUDGANG')}
      {renderExit(850, 220)}
      <text x="500" y="55" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2d5016">HESTESTALDEN</text>
    </>, 1000, 480
  );

  const renderKostalden = () => {
    const top = range(14, 31).map((id, i) => renderBooth(id, 170 + i * 41, 92, 40, 54));
    const middleLeft = [42, 41, 40, 39, 38, 37].map((id, i) => renderBooth(id, 245 + i * 70, 205, 66, 54));
    const middleRight = [35, 34, 33, 32].map((id, i) => renderBooth(id, 700 + i * 58, 205, 55, 54));
    const bottom = range(43, 57).map((id, i) => renderBooth(id, 205 + i * 45, 340, 43, 54));

    return renderCommonPlanShell(
      <>
        <rect x="70" y="75" width="860" height="330" fill="#fffdf7" stroke="#333" strokeWidth="6" />
        <rect x="130" y="160" width="735" height="58" fill="url(#walkway)" stroke="#58a646" />
        <rect x="130" y="275" width="735" height="58" fill="url(#walkway)" stroke="#58a646" />
        <rect x="130" y="160" width="58" height="173" fill="url(#walkway)" stroke="#58a646" />
        <rect x="840" y="90" width="45" height="300" fill="url(#walkway)" stroke="#58a646" />
        {renderBooth(12, 100, 275, 34, 55, 12)}
        {renderBooth(13, 100, 205, 34, 55, 13)}
        {top}
        {middleLeft}
        {middleRight}
        {bottom}
        {renderExit(102, 345)}
        {renderExit(850, 90)}
        {renderExit(850, 345)}
        <text x="500" y="45" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2d5016">KOSTALDEN</text>
        <text x="560" y="245" textAnchor="middle" fontSize="12" fill="#777">Cafeområde</text>
      </>, 1000, 480
    );
  };

  const renderJagtstuen = () => renderCommonPlanShell(
    <>
      <rect x="95" y="88" width="810" height="315" fill="#fffdf7" stroke="#111" strokeWidth="8" />
      <rect x="120" y="225" width="760" height="85" fill="url(#walkway)" stroke="#58a646" />
      {renderBooth(58, 190, 115, 170, 105)}
      {renderBooth(59, 365, 115, 170, 105)}
      {renderBooth(60, 540, 115, 170, 105)}
      {renderBooth(61, 190, 315, 170, 70)}
      {renderBooth(62, 365, 315, 170, 70)}
      {renderBooth(63, 540, 315, 170, 70)}
      {renderExit(125, 245)}
      {renderExit(835, 305)}
      <text x="500" y="52" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2d5016">JAGTSTUEN</text>
    </>, 1000, 480
  );

  const renderLaden = () => {
    const top = range(64, 71).map((id, i) => renderBooth(id, 260 + i * 58, 105, 55, 62));
    const middleA = [74, 81, 80, 79, 82, 83, 84, 85].map((id, i) => renderBooth(id, 260 + i * 63, 235, 60, 62));
    const middleB = [75, 76, 77, 78, 90, 89, 87, 86].map((id, i) => renderBooth(id, 260 + i * 63, 300, 60, 62));
    const bottom = [96, 95, 94, 93, 92, 91].map((id, i) => renderBooth(id, 395 + i * 72, 405, 68, 55));

    return renderCommonPlanShell(
      <>
        <rect x="105" y="70" width="800" height="410" fill="#fffdf7" stroke="#999" strokeWidth="4" />
        <rect x="200" y="170" width="655" height="58" fill="url(#walkway)" stroke="#58a646" />
        <rect x="200" y="360" width="655" height="42" fill="url(#walkway)" stroke="#58a646" />
        <rect x="180" y="90" width="70" height="370" fill="url(#walkway)" stroke="#58a646" />
        <rect x="775" y="115" width="90" height="260" fill="url(#walkway)" stroke="#58a646" />
        {top}
        {middleA}
        {middleB}
        {bottom}
        {renderBooth(97, 125, 250, 42, 118, 97, -90)}
        {renderExit(190, 85)}
        {renderExit(830, 375)}
        <text x="500" y="38" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2d5016">LADEN</text>
        <text x="785" y="95" fontSize="11" fill="#777">Cafeområde</text>
      </>, 1000, 520
    );
  };

  const renderOutdoorArea = () => renderCommonPlanShell(
    <>
      <rect x="0" y="0" width="1000" height="520" fill="#d9f2df" />
      <path d="M75 420 L955 420" stroke="#d7cdb7" strokeWidth="58" strokeLinecap="round" />
      <path d="M500 70 L500 455" stroke="#d7cdb7" strokeWidth="42" strokeLinecap="round" />
      <rect x="235" y="115" width="530" height="270" fill="#eef7e8" stroke="#8caf72" strokeWidth="3" strokeDasharray="10,6" />
      <text x="500" y="55" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2d5016">UDENDØRS OMRÅDE</text>
      <text x="500" y="92" textAnchor="middle" fontSize="13" fill="#666">Udendørsstande 3 x 4 m uden elektricitet</text>
      {range(98, 103).map((id, i) => renderBooth(id, 275 + i * 75, 145, 64, 70))}
      {range(104, 109).map((id, i) => renderBooth(id, 275 + i * 75, 275, 64, 70))}
    </>, 1000, 520
  );

  return (
    <div className="blueprint-booking-container">
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

        <div className="map-toolbar">
          <div>
            <h2>{showingSiteMap ? 'Vælg bygning' : visibleBuilding.name}</h2>
            <p>{showingSiteMap ? 'Klik på en bygning eller udendørsområdet med stande.' : `${visibleBuilding.standIds.length} stande · ${visibleBuilding.standSize}`}</p>
          </div>
          {!showingSiteMap && (
            <button className="map-back-btn" onClick={() => { setActiveBuildingId(null); setSelectedStand(null); setShowApplicationForm(false); }}>
              Tilbage til kort
            </button>
          )}
        </div>

        <div className={`blueprint-canvas ${showingSiteMap ? 'site-map-canvas' : 'floor-plan-canvas'}`}>
          {showingSiteMap ? renderSiteMap() : renderBuildingPlan()}
        </div>

        <div className="building-tabs" aria-label="Bygninger">
          {BUILDINGS.map(building => (
            <button
              key={building.id}
              type="button"
              className={`${building.id === activeBuildingId ? 'active' : ''} ${building.disabled ? 'disabled' : ''}`}
              disabled={building.disabled}
              onClick={() => handleSelectBuilding(building)}
            >
              <span>{building.name}</span>
                  <small>{building.disabled ? building.note : `${building.standIds.length} stande`}</small>
            </button>
          ))}
        </div>

        <div className="legend">
          <div className="legend-item"><div className="legend-color available" />Ledig</div>
          <div className="legend-item"><div className="legend-color booked" />Optaget</div>
          <div className="legend-item"><div className="legend-color pref-1" />1. valg</div>
          <div className="legend-item"><div className="legend-color pref-2" />2. valg</div>
          <div className="legend-item"><div className="legend-color pref-3" />3. valg</div>
        </div>
      </div>

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
        ) : showApplicationForm ? (
          <div className="application-panel">
            <div className="application-header">
              <button className="application-back" onClick={() => setShowApplicationForm(false)}>Tilbage</button>
              <h3>Ansøgningsskema</h3>
              <p>Udfyld oplysningerne for at sende din ansøgning med dine 3 prioriterede standønsker.</p>
            </div>

            <div className="application-summary">
              {userPreferences.map(pref => (
                <div key={pref.standId} className={`submitted-row rank-${pref.rank}`}>
                  <span className="submitted-rank">{RANK_LABEL[pref.rank]}</span>
                  <span>Stand {pref.standId} · {getStandLocation(pref.standId)}</span>
                </div>
              ))}
            </div>

            <div className="application-form">
              <div className="form-field form-field-full">
                <label>Virksomhedens navn *</label>
                <input type="text" value={form.company} onChange={updateForm('company')} />
              </div>
              <div className="form-field form-field-full">
                <label>Kontaktperson *</label>
                <input type="text" value={form.name} onChange={updateForm('name')} />
              </div>
              <div className="form-field">
                <label>CVR nr.</label>
                <input type="text" value={form.cvr} onChange={updateForm('cvr')} />
              </div>
              <div className="form-field">
                <label>Telefon / mobil *</label>
                <input type="tel" value={form.phone} onChange={updateForm('phone')} />
              </div>
              <div className="form-field form-field-full">
                <label>Adresse</label>
                <input type="text" value={form.address} onChange={updateForm('address')} />
              </div>
              <div className="form-field">
                <label>Postnummer og by</label>
                <input type="text" value={form.postalCity} onChange={updateForm('postalCity')} />
              </div>
              <div className="form-field">
                <label>Email *</label>
                <input type="email" value={applicationEmail} onChange={(e) => { setEmail(e.target.value); setForm(prev => ({ ...prev, email: e.target.value })); }} />
              </div>
              <div className="form-field form-field-full">
                <label>Website</label>
                <input type="text" value={form.website} onChange={updateForm('website')} />
              </div>

              <div className="form-field form-field-full">
                <label>Leje af standard stand *</label>
                <div className="stand-type-list">
                  {STAND_TYPES.map(type => (
                    <label key={type.value} className="stand-type-option">
                      <input type="radio" name="standType" value={type.value} checked={form.standType === type.value} onChange={updateForm('standType')} />
                      <span>{type.label}</span>
                      <small>{type.price}</small>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label>Antal borde</label>
                <input type="number" min="0" value={form.tableCount} onChange={updateForm('tableCount')} />
              </div>
              <div className="form-field">
                <label>Antal stole</label>
                <input type="number" min="0" value={form.chairCount} onChange={updateForm('chairCount')} />
              </div>
              <div className="form-field form-field-full">
                <label>Kort beskrivelse af forretning / stand *</label>
                <textarea rows="4" value={form.description} onChange={updateForm('description')} />
              </div>
              <div className="form-field form-field-full">
                <label>For nye stadeholdere: produkter der sælges</label>
                <textarea rows="4" value={form.newVendorProducts} onChange={updateForm('newVendorProducts')} />
              </div>
              <label className="terms-check">
                <input type="checkbox" checked={form.acceptsTerms} onChange={updateForm('acceptsTerms')} />
                <span>Jeg bekræfter, at oplysningerne er korrekte, og at jeg har læst praktisk information og regler i ansøgningsmaterialet.</span>
              </label>
              <button className="btn btn-book drawer-submit" disabled={!isFormValid} onClick={handleFinalSubmit}>
                Indsend ansøgning
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="preferences-panel">
              <h3>Standønsker</h3>
              <p className="pref-hint">Vælg en bygning på kortet, og klik derefter på op til 3 stande.</p>

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
                      <span className="pref-empty-text">Klik på en stand i en bygning</span>
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

              <button
                className="btn btn-submit"
                disabled={!hasThreePreferences}
                onClick={() => setShowApplicationForm(true)}
              >
                Fortsæt til ansøgning
              </button>
              {!hasThreePreferences && (
                <p className="info-msg">Vælg 3 prioriterede stande for at fortsætte.</p>
              )}
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
                    <span className="label">Størrelse</span>
                    <span className="value">{getBuildingForStand(selectedStand.id)?.standSize || `${selectedStand.size} m²`}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Standtype</span>
                    <span className="value">{getStandType(selectedStand.id)?.value}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Pris</span>
                    <span className="value">{selectedStand.priceLabel || getStandType(selectedStand.id)?.price}</span>
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
                  <p>{showingSiteMap ? 'Vælg en bygning for at se stande' : 'Vælg en stand for at se detaljer'}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function renderSiteBuilding(building, onSelect) {
  const disabled = building.disabled;
  const commonProps = {
    className: `site-building ${disabled ? 'disabled' : ''}`,
    onClick: () => onSelect(building),
    role: disabled ? 'img' : 'button',
    'aria-label': building.name,
  };

  const label = (
    <text
      key={`${building.id}-label`}
      x={building.siteLabel.x}
      y={building.siteLabel.y}
      textAnchor="middle"
      fontSize="17"
      fontWeight="700"
      fill={disabled ? '#8b7a63' : '#2d5016'}
      transform={building.id === 'hestestalden' ? `rotate(-69 ${building.siteLabel.x} ${building.siteLabel.y})` : undefined}
    >
      {building.name}
    </text>
  );

  if (building.siteShape === 'restaurant') {
    return (
      <g key={building.id} {...commonProps}>
        <rect x="383" y="118" width="305" height="68" transform="rotate(24 535 152)" fill="#fff8e8" stroke="#e6d5b6" strokeWidth="3" />
        {label}
      </g>
    );
  }

  if (building.siteShape === 'outdoor') {
    return (
      <g key={building.id} {...commonProps}>
        <rect x="302" y="330" width="335" height="230" rx="8" fill="#eef7e8" stroke="#8caf72" strokeWidth="3" strokeDasharray="12,7" />
        {label}
      </g>
    );
  }

  if (building.siteShape === 'left-long') {
    return (
      <g key={building.id} {...commonProps}>
        <rect x="118" y="155" width="70" height="300" transform="rotate(22 153 305)" />
        {label}
      </g>
    );
  }

  if (building.siteShape === 'right-long') {
    return (
      <g key={building.id} {...commonProps}>
        <g transform="rotate(22 750 520)">
          <path d="M705 285 H801 V755 H705 V572 H675 V500 H705 Z" />
        </g>
        {label}
      </g>
    );
  }

  if (building.siteShape === 'bottom-long') {
    return (
      <g key={building.id} {...commonProps}>
        <rect x="168" y="753" width="455" height="106" transform="rotate(26 380 776)" />
        {label}
      </g>
    );
  }

  if (building.siteShape === 'top-left-small') {
    return (
      <g key={building.id} {...commonProps}>
        <rect x="255" y="58" width="105" height="45" transform="rotate(24 307 81)" />
      </g>
    );
  }

  if (building.siteShape === 'left-small') {
    return (
      <g key={building.id} {...commonProps}>
        <rect x="78" y="470" width="48" height="43" transform="rotate(22 102 492)" />
      </g>
    );
  }

  if (building.siteShape === 'bottom-small') {
    return (
      <g key={building.id} {...commonProps}>
        <rect x="300" y="860" width="58" height="46" transform="rotate(25 329 858)" />
      </g>
    );
  }

  return (
    <g key={building.id} {...commonProps}>
      <rect x="365" y="960" width="220" height="115" transform="rotate(25 436 915)" />
      {label}
    </g>
  );
}

export default BlueprintBooking;
