export const COLORS = {
  // Legacy tokens — kept for backward compatibility with other screens
  primary:    '#2E7D32',
  secondary:  '#66BB6A',
  background: '#f5f5f5',
  white:      '#ffffff',
  text:       '#333333',
  textLight:  '#666666',
  error:      '#D32F2F',
  success:    '#388E3C',

  // Design system tokens — match AboutScreen palette exactly
  primaryDeep: '#1B5E20',   // dark green — hero / footer backgrounds (matches About hero)
  gold:        '#E8A000',   // amber — search/CTA buttons only
  greenTint:   '#f0f7f0',   // light green tint — alternating section backgrounds
  border:      '#e8e8e8',   // subtle border / divider
  textPrimary: '#1a1a1a',   // near-black body text
  textMuted:   '#555555',   // secondary / caption text
  iconTint:    '#E8F5E9',   // icon circle backgrounds

  amber: '#F5A623',  // amber accent   — primary CTAs only
};

// ── Centralized status system ─────────────────────────────────────────────────
export const STATUS_COLORS = {
  pending:  { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
  reviewed: { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },
  resolved: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
};
export const STATUS_LABELS = {
  pending:  'Pending',
  reviewed: 'Under Review',
  resolved: 'Resolved',
};

// ── Shadow presets ────────────────────────────────────────────────────────────
export const SHADOWS = {
  xs:    { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2,  elevation: 1 },
  sm:    { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5,  elevation: 2 },
  md:    { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 4 },
  lg:    { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 18, elevation: 8 },
  green: { shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 6 },
};

// ── Spacing scale (multiples of 4) ───────────────────────────────────────────
export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64,
};

// ── Border radius scale ───────────────────────────────────────────────────────
export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 24, pill: 999,
};

export const HOUSING_RESOURCES = [
  {
    id: '1',
    title: 'Durham Housing Authority',
    description: 'Public housing and Section 8 voucher programs',
    phone: '(919) 683-1551',
    address: '200 E Main St, Durham, NC 27701',
  },
  {
    id: '2',
    title: 'Legal Aid of North Carolina',
    description: 'Free legal assistance for housing issues',
    phone: '(919) 856-2564',
    address: '224 S Dawson St, Raleigh, NC 27601',
  },
  {
    id: '3',
    title: 'Durham Crisis Response Center',
    description: 'Emergency housing and support services',
    phone: '(919) 403-6562',
    address: '1403 E Main St, Durham, NC 27703',
  },
];

export const FAQ_DATA = [
  {
    id: '1',
    question: 'What are my rights as a tenant in Durham?',
    answer: 'Tenants in Durham have rights including safe housing, privacy, and protection from discrimination.',
  },
  {
    id: '2',
    question: 'How do I report housing discrimination?',
    answer: 'You can report discrimination to HUD or the NC Human Relations Commission.',
  },
  {
    id: '3',
    question: 'What should I do if my landlord refuses repairs?',
    answer: 'Document the issue, send written requests, and contact legal aid if needed.',
  },
];
