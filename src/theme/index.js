// ─────────────────────────────────────────────────────────────
//  RaPaX™ Mobile — Brand Theme
//  Black. Gold. Sovereign.
// ─────────────────────────────────────────────────────────────

export const Colors = {
  // Core brand
  black:        '#000000',
  blackSoft:    '#0D0D0D',
  blackCard:    '#141414',
  blackBorder:  '#222222',
  blackInput:   '#1A1A1A',

  // Gold palette
  gold:         '#C9A84C',
  goldBright:   '#E8C76A',
  goldDim:      '#7A6230',
  goldMuted:    '#3D3020',

  // White palette
  white:        '#FFFFFF',
  whiteDim:     '#AAAAAA',
  whiteSubtle:  '#666666',

  // Status
  green:        '#27AE60',
  greenDim:     '#1A3D2B',
  red:          '#C0392B',
  redDim:       '#3D1A1A',
  blue:         '#3498DB',
  blueDim:      '#1A2D3D',
  purple:       '#9B59B6',
  purpleDim:    '#2D1A3D',
  orange:       '#E67E22',
  orangeDim:    '#3D2A1A',
};

export const Typography = {
  // Font sizes
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
  xxxl: 38,

  // Font weights
  regular:    '400',
  medium:     '500',
  semibold:   '600',
  bold:       '700',
  extrabold:  '800',

  // Letter spacing
  tight:   -0.5,
  normal:   0,
  wide:     0.5,
  wider:    1,
  widest:   2,
  logo:     4,
};

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

export const Radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  full: 999,
};

export const Shadow = {
  gold: {
    shadowColor:   Colors.gold,
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius:  8,
    elevation:     4,
  },
  card: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius:  12,
    elevation:     6,
  },
};

// Status config — maps transaction status to display properties
export const StatusConfig = {
  pending:        { label: 'Awaiting Payment',    color: Colors.gold,   bg: Colors.goldMuted,   icon: '⏳' },
  confirming:     { label: 'Confirming',           color: Colors.blue,   bg: Colors.blueDim,     icon: '🔍' },
  confirmed:      { label: 'Confirmed',            color: Colors.green,  bg: Colors.greenDim,    icon: '✓'  },
  fingerprinting: { label: 'Fingerprinting',       color: Colors.purple, bg: Colors.purpleDim,   icon: '🔏' },
  delivering:     { label: 'Preparing Delivery',   color: Colors.orange, bg: Colors.orangeDim,   icon: '📦' },
  complete:       { label: 'Complete',             color: Colors.green,  bg: Colors.greenDim,    icon: '✅' },
  failed:         { label: 'Failed',               color: Colors.red,    bg: Colors.redDim,      icon: '✗'  },
  expired:        { label: 'Expired',              color: Colors.whiteSubtle, bg: Colors.blackBorder, icon: '⌛' },
};

export const CurrencyConfig = {
  BTC:  { symbol: '₿', name: 'Bitcoin',       color: '#F7931A' },
  ETH:  { symbol: 'Ξ', name: 'Ethereum',      color: '#627EEA' },
  SOL:  { symbol: '◎', name: 'Solana',         color: '#9945FF' },
  USDT: { symbol: '₮', name: 'Tether (USDT)', color: '#26A17B' },
};
