// ─────────────────────────────────────────────────────────────
//  RaPaX™ Mobile — Shared UI Components
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, Animated,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow, StatusConfig, CurrencyConfig } from '../theme';

// ── Logo ──────────────────────────────────────────────────────
export function RaPaXLogo({ size = 'md' }) {
  const sizes = { sm: 18, md: 26, lg: 36 };
  const fontSize = sizes[size] || 26;
  return (
    <View>
      <Text style={[styles.logoText, { fontSize, letterSpacing: fontSize * 0.15 }]}>
        RaPaX™
      </Text>
      <Text style={styles.logoSub}>SOVEREIGN VENDING MACHINE</Text>
    </View>
  );
}

// ── Gold Button ───────────────────────────────────────────────
export function GoldButton({ title, onPress, loading, disabled, style, small }) {
  return (
    <TouchableOpacity
      style={[styles.goldBtn, small && styles.goldBtnSm, disabled && styles.goldBtnDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={Colors.black} size="small" />
        : <Text style={[styles.goldBtnText, small && styles.goldBtnTextSm]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

// ── Ghost Button ──────────────────────────────────────────────
export function GhostButton({ title, onPress, disabled, style, small }) {
  return (
    <TouchableOpacity
      style={[styles.ghostBtn, small && styles.ghostBtnSm, disabled && styles.ghostBtnDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.ghostBtnText, small && styles.ghostBtnTextSm]}>{title}</Text>
    </TouchableOpacity>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Card Title ────────────────────────────────────────────────
export function CardTitle({ children }) {
  return <Text style={styles.cardTitle}>{children}</Text>;
}

// ── Section Header ────────────────────────────────────────────
export function SectionHeader({ title, right }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      {right}
    </View>
  );
}

// ── Status Badge ──────────────────────────────────────────────
export function StatusBadge({ status }) {
  const cfg = StatusConfig[status] || { label: status, color: Colors.whiteDim, bg: Colors.blackBorder, icon: '?' };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>
        {cfg.icon} {cfg.label.toUpperCase()}
      </Text>
    </View>
  );
}

// ── Currency Badge ────────────────────────────────────────────
export function CurrencyBadge({ currency }) {
  const cfg = CurrencyConfig[currency] || { symbol: currency, color: Colors.whiteDim };
  return (
    <View style={[styles.currencyBadge, { borderColor: cfg.color + '44' }]}>
      <Text style={[styles.currencyBadgeText, { color: cfg.color }]}>
        {cfg.symbol} {currency}
      </Text>
    </View>
  );
}

// ── Text Input ────────────────────────────────────────────────
export function RaPaXInput({ label, ...props }) {
  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.whiteSubtle}
        selectionColor={Colors.gold}
        {...props}
      />
    </View>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
export function StatCard({ value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Mono text (for addresses, IDs, hashes) ────────────────────
export function MonoText({ children, style }) {
  return <Text style={[styles.mono, style]}>{children}</Text>;
}

// ── Divider ───────────────────────────────────────────────────
export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// ── Loading spinner ───────────────────────────────────────────
export function LoadingSpinner({ color = Colors.gold }) {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator color={color} size="large" />
    </View>
  );
}

// ── Alert banner ──────────────────────────────────────────────
export function AlertBanner({ message, type = 'error' }) {
  const cfg = {
    error:   { bg: Colors.redDim,   border: Colors.red,   text: '#FF6666' },
    success: { bg: Colors.greenDim, border: Colors.green,  text: '#66FF99' },
    info:    { bg: Colors.blueDim,  border: Colors.blue,   text: '#66BBFF' },
  }[type] || {};
  return (
    <View style={[styles.alertBanner, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.alertText, { color: cfg.text }]}>{message}</Text>
    </View>
  );
}

// ── Row item (for lists) ──────────────────────────────────────
export function RowItem({ label, value, mono, accent }) {
  return (
    <View style={styles.rowItem}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono, accent && { color: Colors.gold }]} numberOfLines={1}>
        {value || '—'}
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  logoText: {
    color:      Colors.gold,
    fontWeight: Typography.extrabold,
    letterSpacing: Typography.logo,
  },
  logoSub: {
    color:       Colors.whiteDim,
    fontSize:    Typography.xs,
    letterSpacing: Typography.wider,
    marginTop:   2,
  },

  goldBtn: {
    backgroundColor: Colors.gold,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems:      'center',
    ...Shadow.gold,
  },
  goldBtnSm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  goldBtnDisabled: { opacity: 0.4 },
  goldBtnText: { color: Colors.black, fontWeight: Typography.bold, fontSize: Typography.base, letterSpacing: Typography.wide },
  goldBtnTextSm: { fontSize: Typography.sm },

  ghostBtn: {
    borderWidth:     1,
    borderColor:     Colors.blackBorder,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems:      'center',
  },
  ghostBtnSm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  ghostBtnDisabled: { opacity: 0.4 },
  ghostBtnText: { color: Colors.whiteDim, fontWeight: Typography.medium, fontSize: Typography.base },
  ghostBtnTextSm: { fontSize: Typography.sm },

  card: {
    backgroundColor: Colors.blackCard,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.blackBorder,
    padding:         Spacing.base,
    marginBottom:    Spacing.md,
  },
  cardTitle: {
    color:         Colors.gold,
    fontSize:      Typography.xs,
    fontWeight:    Typography.semibold,
    letterSpacing: Typography.widest,
    textTransform: 'uppercase',
    marginBottom:  Spacing.md,
  },

  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.sm,
    marginTop:      Spacing.base,
  },
  sectionHeaderText: {
    color:         Colors.gold,
    fontSize:      Typography.xs,
    fontWeight:    Typography.semibold,
    letterSpacing: Typography.widest,
    textTransform: 'uppercase',
  },

  badge: {
    borderRadius:    Radius.full,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    alignSelf:       'flex-start',
  },
  badgeText: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: Typography.wide },

  currencyBadge: {
    borderRadius:  Radius.sm,
    borderWidth:   1,
    paddingVertical:   2,
    paddingHorizontal: Spacing.sm,
    alignSelf:     'flex-start',
  },
  currencyBadgeText: { fontSize: Typography.xs, fontWeight: Typography.semibold },

  inputWrap:  { marginBottom: Spacing.md },
  inputLabel: { color: Colors.gold, fontSize: Typography.xs, fontWeight: Typography.medium, letterSpacing: Typography.wide, marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.blackInput,
    borderWidth:     1,
    borderColor:     Colors.blackBorder,
    borderRadius:    Radius.md,
    color:           Colors.white,
    fontSize:        Typography.base,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },

  statCard: {
    flex:           1,
    backgroundColor: Colors.blackCard,
    borderRadius:   Radius.lg,
    borderWidth:    1,
    borderColor:    Colors.blackBorder,
    padding:        Spacing.base,
    alignItems:     'center',
    margin:         Spacing.xs,
  },
  statValue: { color: Colors.gold, fontSize: Typography.xxl, fontWeight: Typography.bold },
  statLabel: { color: Colors.whiteDim, fontSize: Typography.xs, letterSpacing: Typography.wider, textTransform: 'uppercase', marginTop: 4 },

  mono: { fontFamily: 'monospace', fontSize: Typography.xs, color: Colors.whiteDim },

  divider: { height: 1, backgroundColor: Colors.blackBorder, marginVertical: Spacing.md },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyIcon:  { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.whiteDim, fontSize: Typography.md, fontWeight: Typography.medium },
  emptySubtitle: { color: Colors.whiteSubtle, fontSize: Typography.sm, marginTop: Spacing.xs, textAlign: 'center' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl },

  alertBanner: {
    borderRadius:  Radius.md,
    borderWidth:   1,
    padding:       Spacing.md,
    marginBottom:  Spacing.md,
  },
  alertText: { fontSize: Typography.sm, fontWeight: Typography.medium },

  rowItem: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: Spacing.xs,
  },
  rowLabel: { color: Colors.whiteDim, fontSize: Typography.sm, flex: 1 },
  rowValue: { color: Colors.white, fontSize: Typography.sm, flex: 2, textAlign: 'right' },
});
