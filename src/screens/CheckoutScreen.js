// ─────────────────────────────────────────────────────────────
//  RaPaX™ Mobile — Checkout Screen
//  Shows payment address + QR, polls status, shows download link
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Typography, Spacing, Radius, CurrencyConfig, StatusConfig } from '../theme';
import {
  Card, CardTitle, GoldButton, GhostButton, StatusBadge,
  MonoText, Divider, RowItem, AlertBanner, LoadingSpinner,
} from '../components';
import { getPurchaseStatus } from '../services/api';

const POLL_INTERVAL = 15000;
const TERMINAL = new Set(['complete', 'failed', 'expired']);

export default function CheckoutScreen({ route, navigation }) {
  const { product, purchase, currency } = route.params;
  const cfg = CurrencyConfig[currency] || {};

  const [status,    setStatus]    = useState(null);
  const [polling,   setPolling]   = useState(true);
  const [copied,    setCopied]    = useState(false);
  const intervalRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const s = await getPurchaseStatus(purchase.transaction_id);
      setStatus(s);
      if (TERMINAL.has(s.status)) {
        setPolling(false);
        clearInterval(intervalRef.current);
      }
    } catch (_) {}
  }, [purchase.transaction_id]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [poll]);

  function copyAddress() {
    Clipboard.setString(purchase.payment_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openDownload() {
    if (status?.download_link) {
      Linking.openURL(status.download_link).catch(() =>
        Alert.alert('Error', 'Could not open download link.')
      );
    }
  }

  const expiresAt   = new Date(purchase.expires_at);
  const expiresStr  = expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isDelivered = status?.status === 'delivering' || status?.status === 'complete';
  const isFailed    = status?.status === 'failed' || status?.status === 'expired';

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.subtitle}>v{product.version}</Text>
      </View>

      {/* ── Status ── */}
      <Card>
        <CardTitle>TRANSACTION STATUS</CardTitle>
        <View style={styles.statusRow}>
          {status
            ? <StatusBadge status={status.status} />
            : <Text style={styles.statusLoading}>Checking…</Text>
          }
          {polling ? (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          ) : null}
        </View>
        {status?.confirmations ? (
          <Text style={styles.confirmText}>{status.confirmations} confirmation{status.confirmations !== 1 ? 's' : ''}</Text>
        ) : null}
        <RowItem label="Transaction ID" value={purchase.transaction_id.slice(0, 20) + '…'} mono />
      </Card>

      {/* ── Payment address ── */}
      {!isDelivered && !isFailed ? (
        <Card>
          <CardTitle>SEND PAYMENT</CardTitle>
          <View style={styles.amountRow}>
            <Text style={[styles.amountSymbol, { color: cfg.color }]}>{cfg.symbol}</Text>
            <Text style={styles.amountValue}>{purchase.amount_expected}</Text>
            <Text style={styles.amountCurrency}>{currency}</Text>
          </View>
          <Text style={styles.exactNote}>Send this exact amount to the address below.</Text>

          <Divider />

          {/* QR Code */}
          <View style={styles.qrWrap}>
            <QRCode
              value={purchase.payment_address}
              size={180}
              color={Colors.gold}
              backgroundColor={Colors.blackCard}
            />
          </View>

          {/* Address */}
          <TouchableOpacity style={styles.addressBox} onPress={copyAddress} activeOpacity={0.8}>
            <MonoText style={styles.addressText}>{purchase.payment_address}</MonoText>
            <Text style={[styles.copyBtn, copied && styles.copyBtnDone]}>
              {copied ? '✓ COPIED' : 'TAP TO COPY'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.expires}>Address expires at {expiresStr}</Text>
        </Card>
      ) : null}

      {/* ── Download ready ── */}
      {isDelivered && status?.download_link ? (
        <Card style={styles.deliveredCard}>
          <CardTitle>✅ DOWNLOAD READY</CardTitle>
          <Text style={styles.deliveredText}>
            Payment confirmed. Your fingerprinted asset is ready.
          </Text>
          <Text style={styles.deliveredNote}>
            This link is unique to your transaction. Do not share it.
          </Text>
          {status.download_expires_at ? (
            <Text style={styles.linkExpiry}>
              Expires: {new Date(status.download_expires_at).toLocaleString()}
            </Text>
          ) : null}
          <GoldButton
            title="⬇  DOWNLOAD NOW"
            onPress={openDownload}
            style={styles.downloadBtn}
          />
        </Card>
      ) : null}

      {/* ── Failed ── */}
      {isFailed ? (
        <AlertBanner
          message={`Transaction ${status?.status}. Contact the operator with your Transaction ID.`}
          type="error"
        />
      ) : null}

      {/* ── Info ── */}
      <Card>
        <CardTitle>ORDER DETAILS</CardTitle>
        <RowItem label="Product"    value={product.name} />
        <RowItem label="Version"    value={product.version} />
        <RowItem label="Currency"   value={currency} />
        <RowItem label="Amount"     value={`${purchase.amount_expected} ${currency}`} accent />
      </Card>

      <GhostButton title="BACK TO SHOP" onPress={() => navigation.navigate('Shop')} />

      <Text style={styles.footer}>
        Powered by RaPaX™ — Sovereign. Zero-Trust. Zero Compromise.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.black },
  scroll: { padding: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.xxxl },

  header:      { marginBottom: Spacing.base },
  productName: { color: Colors.white, fontSize: Typography.xl, fontWeight: Typography.bold },
  subtitle:    { color: Colors.whiteDim, fontSize: Typography.sm, marginTop: 4 },

  statusRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  statusLoading:{ color: Colors.whiteDim, fontSize: Typography.sm },
  liveIndicator:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot:      { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.green },
  liveText:     { color: Colors.green, fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: Typography.wider },
  confirmText:  { color: Colors.whiteDim, fontSize: Typography.xs, marginBottom: Spacing.sm },

  amountRow:    { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, marginBottom: Spacing.xs },
  amountSymbol: { fontSize: Typography.xxl, fontWeight: Typography.extrabold },
  amountValue:  { color: Colors.white, fontSize: Typography.xxl, fontWeight: Typography.extrabold },
  amountCurrency:{ color: Colors.whiteDim, fontSize: Typography.md },
  exactNote:    { color: Colors.whiteSubtle, fontSize: Typography.xs, marginBottom: Spacing.sm },

  qrWrap: {
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.blackInput,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },

  addressBox: {
    backgroundColor: Colors.blackInput,
    borderRadius:    Radius.md,
    borderWidth:     1,
    borderColor:     Colors.goldDim,
    padding:         Spacing.md,
    marginBottom:    Spacing.sm,
  },
  addressText: { color: Colors.gold, fontSize: 11, lineHeight: 18 },
  copyBtn:     { color: Colors.whiteSubtle, fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: Typography.wider, marginTop: Spacing.sm, textAlign: 'right' },
  copyBtnDone: { color: Colors.green },
  expires:     { color: Colors.whiteSubtle, fontSize: Typography.xs, textAlign: 'center' },

  deliveredCard: { borderColor: Colors.green + '44' },
  deliveredText: { color: Colors.white, fontSize: Typography.base, marginBottom: Spacing.sm },
  deliveredNote: { color: Colors.whiteDim, fontSize: Typography.sm, marginBottom: Spacing.sm },
  linkExpiry:    { color: Colors.whiteSubtle, fontSize: Typography.xs, marginBottom: Spacing.md },
  downloadBtn:   { marginTop: Spacing.xs },

  footer: {
    color:     Colors.whiteSubtle,
    fontSize:  Typography.xs,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
