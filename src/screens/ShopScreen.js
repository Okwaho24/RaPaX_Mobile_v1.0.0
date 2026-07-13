// ─────────────────────────────────────────────────────────────
//  RaPaX™ Mobile — Shop Screen (Buyer)
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, Modal, ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, CurrencyConfig } from '../theme';
import {
  Card, CardTitle, GoldButton, GhostButton, LoadingSpinner,
  EmptyState, Divider, RaPaXLogo, AlertBanner,
} from '../components';
import { listProducts, initiatePurchase } from '../services/api';

const CURRENCIES = ['BTC', 'ETH', 'SOL', 'USDT'];

export default function ShopScreen({ navigation }) {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [error,     setError]     = useState('');
  const [selected,  setSelected]  = useState(null);   // selected product
  const [currency,  setCurrency]  = useState('');
  const [wallet,    setWallet]    = useState('');
  const [buying,    setBuying]    = useState(false);
  const [buyError,  setBuyError]  = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const p = await listProducts();
      setProducts(p);
    } catch (e) {
      setError('Cannot reach RaPaX™ server. Check Settings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openProduct(product) {
    setSelected(product);
    setBuyError('');
    // Pre-select first available currency
    const avail = CURRENCIES.filter(c => product[`price_${c.toLowerCase()}`]);
    setCurrency(avail[0] || '');
  }

  function closeModal() { setSelected(null); setCurrency(''); setBuyError(''); }

  async function handleBuy() {
    if (!currency) return setBuyError('Select a payment currency');
    setBuying(true); setBuyError('');
    try {
      const purchase = await initiatePurchase({
        productId:   selected.product_id,
        currency,
        buyerWallet: wallet || null,
      });
      closeModal();
      navigation.navigate('Checkout', { product: selected, purchase, currency });
    } catch (e) {
      setBuyError(e.response?.data?.error || e.message || 'Purchase failed');
    } finally {
      setBuying(false);
    }
  }

  if (loading) return <View style={styles.root}><LoadingSpinner /></View>;

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <RaPaXLogo size="sm" />
      </View>

      {error ? <AlertBanner message={error} type="error" /> : null}

      <FlatList
        data={products}
        keyExtractor={p => p.product_id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={Colors.gold} colors={[Colors.gold]} />
        }
        ListEmptyComponent={
          <EmptyState icon="📭" title="No products available" subtitle="Check back soon." />
        }
        renderItem={({ item: p }) => {
          const prices = CURRENCIES
            .filter(c => p[`price_${c.toLowerCase()}`])
            .map(c => `${CurrencyConfig[c].symbol} ${p[`price_${c.toLowerCase()}`]} ${c}`)
            .join('  ·  ');

          return (
            <TouchableOpacity onPress={() => openProduct(p)} activeOpacity={0.85}>
              <Card style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <View style={styles.versionBadge}>
                    <Text style={styles.versionText}>v{p.version}</Text>
                  </View>
                </View>
                {p.description ? (
                  <Text style={styles.productDesc} numberOfLines={2}>{p.description}</Text>
                ) : null}
                <Divider style={styles.divider} />
                <Text style={styles.priceRow}>{prices}</Text>
                <GoldButton title="BUY NOW" onPress={() => openProduct(p)} style={styles.buyBtn} />
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Currency / buy modal ── */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView>
              {selected ? (
                <>
                  <Text style={styles.modalTitle}>{selected.name}</Text>
                  {selected.description ? (
                    <Text style={styles.modalDesc}>{selected.description}</Text>
                  ) : null}

                  <Divider />

                  <Text style={styles.currencyLabel}>SELECT CURRENCY</Text>
                  <View style={styles.currencyGrid}>
                    {CURRENCIES.filter(c => selected[`price_${c.toLowerCase()}`]).map(c => {
                      const cfg   = CurrencyConfig[c];
                      const price = selected[`price_${c.toLowerCase()}`];
                      const active = currency === c;
                      return (
                        <TouchableOpacity
                          key={c}
                          style={[styles.currencyChip, active && { borderColor: cfg.color, backgroundColor: cfg.color + '22' }]}
                          onPress={() => setCurrency(c)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.currencyChipSymbol, { color: cfg.color }]}>{cfg.symbol}</Text>
                          <Text style={[styles.currencyChipName, active && { color: Colors.white }]}>{c}</Text>
                          <Text style={[styles.currencyChipPrice, { color: cfg.color }]}>
                            {price} {c}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {buyError ? <AlertBanner message={buyError} type="error" /> : null}

                  <GoldButton
                    title={`PAY WITH ${currency || '...'}`}
                    onPress={handleBuy}
                    loading={buying}
                    disabled={!currency}
                    style={styles.buyModalBtn}
                  />
                  <GhostButton title="CANCEL" onPress={closeModal} style={styles.cancelBtn} />
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: Colors.black },
  topBar:   { padding: Spacing.base, paddingTop: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.blackBorder },
  list:     { padding: Spacing.base },

  productCard:   { marginBottom: Spacing.md },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xs },
  productName:   { color: Colors.white, fontSize: Typography.md, fontWeight: Typography.bold, flex: 1 },
  versionBadge:  { backgroundColor: Colors.blackInput, borderRadius: Radius.sm, paddingVertical: 2, paddingHorizontal: 6, marginLeft: Spacing.sm },
  versionText:   { color: Colors.whiteDim, fontSize: Typography.xs, fontFamily: 'monospace' },
  productDesc:   { color: Colors.whiteDim, fontSize: Typography.sm, lineHeight: 18 },
  divider:       { marginVertical: Spacing.sm },
  priceRow:      { color: Colors.gold, fontSize: Typography.sm, fontWeight: Typography.semibold, marginBottom: Spacing.sm },
  buyBtn:        { marginTop: Spacing.xs },

  modalOverlay:  { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.85)' },
  modalSheet: {
    backgroundColor: Colors.blackCard,
    borderTopLeftRadius:  Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.goldDim,
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.blackBorder,
    alignSelf: 'center', marginBottom: Spacing.base,
  },
  modalTitle:    { color: Colors.white, fontSize: Typography.xl, fontWeight: Typography.bold, marginBottom: Spacing.xs },
  modalDesc:     { color: Colors.whiteDim, fontSize: Typography.sm, lineHeight: 18 },
  currencyLabel: { color: Colors.gold, fontSize: Typography.xs, fontWeight: Typography.semibold, letterSpacing: Typography.widest, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  currencyGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  currencyChip: {
    width: '47%', borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.blackBorder, padding: Spacing.md,
    backgroundColor: Colors.blackInput,
  },
  currencyChipSymbol: { fontSize: Typography.lg, fontWeight: Typography.bold },
  currencyChipName:   { color: Colors.whiteDim, fontSize: Typography.sm, fontWeight: Typography.semibold, marginTop: 2 },
  currencyChipPrice:  { fontSize: Typography.sm, fontWeight: Typography.bold, marginTop: 4 },
  buyModalBtn:   { marginTop: Spacing.sm },
  cancelBtn:     { marginTop: Spacing.sm },
});
