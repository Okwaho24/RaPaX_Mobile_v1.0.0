// ─────────────────────────────────────────────────────────────
//  RaPaX™ Mobile — Operator Dashboard Screen
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, Switch,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, StatusConfig } from '../theme';
import {
  Card, CardTitle, GoldButton, GhostButton, StatCard, StatusBadge,
  CurrencyBadge, RowItem, Divider, EmptyState, LoadingSpinner,
  AlertBanner, MonoText, SectionHeader,
} from '../components';
import {
  getAllProducts, getTransactions, getDeliveries,
  getAuditLogs, toggleProduct, confirmPayment,
} from '../services/api';

const TABS = ['STATS', 'PRODUCTS', 'TRANSACTIONS', 'LOGS'];

export default function OperatorScreen() {
  const [tab,          setTab]          = useState('STATS');
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');
  const [products,     setProducts]     = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [deliveries,   setDeliveries]   = useState([]);
  const [logs,         setLogs]         = useState([]);

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [p, t, d, l] = await Promise.all([
        getAllProducts(),
        getTransactions(100),
        getDeliveries(100),
        getAuditLogs(50),
      ]);
      setProducts(p);
      setTransactions(t);
      setDeliveries(d);
      setLogs(l);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load data. Check settings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleToggle(product) {
    try {
      await toggleProduct(product.product_id);
      setSuccess(`${product.name} ${product.availability ? 'deactivated' : 'activated'}`);
      loadAll();
    } catch (e) {
      setError('Toggle failed');
    }
  }

  async function handleConfirm(tx) {
    Alert.alert(
      'Confirm Payment',
      `Manually confirm payment for transaction ${tx.transaction_id.slice(0,16)}…?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await confirmPayment({
                transactionId:  tx.transaction_id,
                txHash:         null,
                amountReceived: tx.amount_expected,
              });
              setSuccess('Payment confirmed — pipeline started');
              loadAll();
            } catch (e) {
              setError('Confirmation failed: ' + (e.response?.data?.error || e.message));
            }
          }
        }
      ]
    );
  }

  // ── Stats ────────────────────────────────────────────────────
  const complete  = transactions.filter(t => t.status === 'complete').length;
  const pending   = transactions.filter(t => ['pending','confirming'].includes(t.status)).length;
  const available = products.filter(p => p.availability).length;

  // Revenue by currency
  const revenue = {};
  transactions.filter(t => t.status === 'complete' && t.amount_received).forEach(t => {
    revenue[t.currency] = (revenue[t.currency] || 0) + t.amount_received;
  });

  if (loading) return <View style={styles.root}><LoadingSpinner /></View>;

  return (
    <View style={styles.root}>
      {/* ── Tab bar ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }}
            tintColor={Colors.gold} colors={[Colors.gold]} />
        }
      >
        {error   ? <AlertBanner message={error}   type="error"   /> : null}
        {success ? <AlertBanner message={success} type="success" /> : null}

        {/* ── STATS ── */}
        {tab === 'STATS' && (
          <>
            <View style={styles.statsGrid}>
              <StatCard value={products.length} label="Products" />
              <StatCard value={available}        label="Available" />
              <StatCard value={transactions.length} label="Transactions" />
              <StatCard value={complete}         label="Complete" />
              <StatCard value={pending}          label="Pending" />
              <StatCard value={deliveries.length} label="Deliveries" />
            </View>

            <Card>
              <CardTitle>REVENUE BY CURRENCY</CardTitle>
              {Object.keys(revenue).length
                ? Object.entries(revenue).map(([c, v]) => (
                    <RowItem key={c} label={c} value={`${v.toFixed(6)} ${c}`} accent />
                  ))
                : <Text style={styles.noData}>No completed sales yet</Text>
              }
            </Card>

            <Card>
              <CardTitle>RECENT TRANSACTIONS</CardTitle>
              {transactions.slice(0, 5).map(tx => (
                <View key={tx.transaction_id}>
                  <RowItem label={tx.currency} value={`${tx.amount_expected}`} accent />
                  <View style={styles.txMeta}>
                    <StatusBadge status={tx.status} />
                    <Text style={styles.txDate}>{new Date(tx.created_at).toLocaleDateString()}</Text>
                  </View>
                  <Divider />
                </View>
              ))}
              {!transactions.length && <EmptyState icon="📊" title="No transactions yet" />}
            </Card>
          </>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'PRODUCTS' && (
          <>
            {products.map(p => (
              <Card key={p.product_id}>
                <View style={styles.productRow}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <MonoText>v{p.version}</MonoText>
                  </View>
                  <Switch
                    value={!!p.availability}
                    onValueChange={() => handleToggle(p)}
                    trackColor={{ false: Colors.blackBorder, true: Colors.goldDim }}
                    thumbColor={p.availability ? Colors.gold : Colors.whiteDim}
                  />
                </View>
                <View style={styles.priceRow}>
                  {['btc','eth','sol','usdt'].filter(c => p[`price_${c}`]).map(c => (
                    <View key={c} style={styles.priceChip}>
                      <Text style={styles.priceChipText}>{c.toUpperCase()}: {p[`price_${c}`]}</Text>
                    </View>
                  ))}
                </View>
                <MonoText style={styles.productId}>{p.product_id.slice(0, 24)}…</MonoText>
              </Card>
            ))}
            {!products.length && <EmptyState icon="📦" title="No products" subtitle="Upload via the web dashboard" />}
          </>
        )}

        {/* ── TRANSACTIONS ── */}
        {tab === 'TRANSACTIONS' && (
          <>
            {transactions.map(tx => (
              <Card key={tx.transaction_id}>
                <View style={styles.txHeader}>
                  <CurrencyBadge currency={tx.currency} />
                  <StatusBadge status={tx.status} />
                </View>
                <RowItem label="Amount"    value={`${tx.amount_expected} ${tx.currency}`} accent />
                <RowItem label="Received"  value={tx.amount_received ? `${tx.amount_received} ${tx.currency}` : '—'} />
                <RowItem label="TX Hash"   value={tx.tx_hash ? tx.tx_hash.slice(0, 20) + '…' : '—'} mono />
                <RowItem label="Date"      value={new Date(tx.created_at).toLocaleString()} />
                <MonoText style={styles.txId}>{tx.transaction_id.slice(0, 28)}…</MonoText>

                {['pending','confirming'].includes(tx.status) && (
                  <GoldButton
                    title="CONFIRM PAYMENT"
                    onPress={() => handleConfirm(tx)}
                    small
                    style={styles.confirmBtn}
                  />
                )}
              </Card>
            ))}
            {!transactions.length && <EmptyState icon="🔄" title="No transactions yet" />}
          </>
        )}

        {/* ── LOGS ── */}
        {tab === 'LOGS' && (
          <>
            {logs.map(log => {
              const payload = (() => { try { return JSON.parse(log.payload); } catch { return {}; } })();
              return (
                <Card key={log.log_id}>
                  <View style={styles.logHeader}>
                    <View style={[styles.logTypeBadge, { backgroundColor: logColor(log.event_type) + '33' }]}>
                      <Text style={[styles.logTypeText, { color: logColor(log.event_type) }]}>
                        {log.event_type}
                      </Text>
                    </View>
                    <Text style={styles.logDate}>{new Date(log.created_at).toLocaleString()}</Text>
                  </View>
                  <Text style={styles.logAction}>{payload.action || '—'}</Text>
                  <MonoText>{log.actor || 'system'}</MonoText>
                </Card>
              );
            })}
            {!logs.length && <EmptyState icon="📋" title="No audit log entries" />}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function logColor(type) {
  return { PAYMENT: Colors.gold, FINGERPRINT: '#9B59B6', DELIVERY: Colors.green,
           PRODUCT: Colors.blue, SYSTEM: Colors.whiteDim }[type] || Colors.whiteDim;
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.black },
  tabBar:  { backgroundColor: Colors.blackSoft, borderBottomWidth: 1, borderBottomColor: Colors.blackBorder },
  tabBarContent: { paddingHorizontal: Spacing.sm },
  tab: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:     { borderBottomColor: Colors.gold },
  tabText:       { color: Colors.whiteDim, fontSize: Typography.xs, fontWeight: Typography.semibold, letterSpacing: Typography.wider },
  tabTextActive: { color: Colors.gold },
  content:       { flex: 1 },
  contentInner:  { padding: Spacing.base, paddingBottom: Spacing.xxxl },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', margin: -Spacing.xs, marginBottom: Spacing.sm },

  noData: { color: Colors.whiteDim, fontSize: Typography.sm, textAlign: 'center', paddingVertical: Spacing.sm },

  txMeta:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: Spacing.xs },
  txDate:   { color: Colors.whiteDim, fontSize: Typography.xs },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  txId:     { marginTop: Spacing.xs },
  confirmBtn: { marginTop: Spacing.sm },

  productRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  productInfo: { flex: 1 },
  productName: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.semibold, marginBottom: 2 },
  productId:   { marginTop: Spacing.xs },
  priceRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.xs },
  priceChip:   { backgroundColor: Colors.blackInput, borderRadius: Radius.sm, paddingVertical: 2, paddingHorizontal: 6 },
  priceChipText:{ color: Colors.whiteDim, fontSize: Typography.xs, fontFamily: 'monospace' },

  logHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  logTypeBadge: { borderRadius: Radius.sm, paddingVertical: 2, paddingHorizontal: 6 },
  logTypeText:  { fontSize: Typography.xs, fontWeight: Typography.bold },
  logDate:      { color: Colors.whiteSubtle, fontSize: Typography.xs },
  logAction:    { color: Colors.white, fontSize: Typography.sm, fontWeight: Typography.medium, marginBottom: 2 },
});
