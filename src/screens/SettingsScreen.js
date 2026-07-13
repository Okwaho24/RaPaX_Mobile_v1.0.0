// ─────────────────────────────────────────────────────────────
//  RaPaX™ Mobile — Settings Screen
//  First-run config: API URL + operator secret
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { RaPaXLogo, GoldButton, GhostButton, RaPaXInput, Card, CardTitle, AlertBanner, Divider } from '../components';
import { saveConfig, loadConfig, getBaseUrl, hasConfig, clearConfig } from '../services/api';

export default function SettingsScreen({ navigation, onConfigured }) {
  const [apiUrl,   setApiUrl]   = useState('http://192.168.1.100:4000/api');
  const [secret,   setSecret]   = useState('');
  const [isOp,     setIsOp]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    loadConfig().then(() => {
      const url = getBaseUrl();
      if (url) setApiUrl(url);
      if (hasConfig()) setIsOp(true);
    });
  }, []);

  async function handleSave() {
    if (!apiUrl.trim()) return setError('API URL is required');
    setLoading(true); setError(''); setSuccess('');
    try {
      await saveConfig({ apiUrl: apiUrl.trim(), operatorSecret: secret.trim() });
      setSuccess('Configuration saved. You\'re connected to RaPaX™.');
      setTimeout(() => onConfigured && onConfigured(), 1000);
    } catch (e) {
      setError(e.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    await clearConfig();
    setSecret(''); setIsOp(false);
    setSuccess('Configuration cleared.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <RaPaXLogo size="lg" />
        </View>

        {error   ? <AlertBanner message={error}   type="error"   /> : null}
        {success ? <AlertBanner message={success} type="success" /> : null}

        <Card>
          <CardTitle>SERVER CONNECTION</CardTitle>
          <RaPaXInput
            label="RAPAX™ API URL"
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="http://192.168.1.100:4000/api"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Text style={styles.hint}>
            Enter the IP address of the machine running RaPaX™.{'\n'}
            Must be on the same network or accessible via your domain.
          </Text>
        </Card>

        <Card>
          <CardTitle>OPERATOR ACCESS</CardTitle>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable Operator Mode</Text>
            <Switch
              value={isOp}
              onValueChange={setIsOp}
              trackColor={{ false: Colors.blackBorder, true: Colors.goldDim }}
              thumbColor={isOp ? Colors.gold : Colors.whiteDim}
            />
          </View>
          <Text style={styles.hint}>
            Operator mode unlocks product management, transaction logs, and audit exports.
          </Text>

          {isOp ? (
            <RaPaXInput
              label="OPERATOR SECRET"
              value={secret}
              onChangeText={setSecret}
              placeholder="Your operator secret from .env"
              secureTextEntry={!showSecret}
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : null}
        </Card>

        <GoldButton
          title="SAVE CONFIGURATION"
          onPress={handleSave}
          loading={loading}
          style={styles.saveBtn}
        />

        {hasConfig() ? (
          <GhostButton
            title="Clear Configuration"
            onPress={handleClear}
            style={styles.clearBtn}
          />
        ) : null}

        <Divider />

        <Text style={styles.footer}>
          © Archer Chain Analytics™{'\n'}
          Sovereign. Zero-Trust. Zero Compromise.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.black },
  scroll: { padding: Spacing.base, paddingTop: Spacing.xxxl },
  header: { alignItems: 'center', marginBottom: Spacing.xxxl },
  hint:   { color: Colors.whiteSubtle, fontSize: Typography.xs, lineHeight: 18, marginTop: Spacing.xs },
  switchRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing.md,
  },
  switchLabel: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.medium },
  saveBtn:  { marginTop: Spacing.xs },
  clearBtn: { marginTop: Spacing.md },
  footer: {
    color:     Colors.whiteSubtle,
    fontSize:  Typography.xs,
    textAlign: 'center',
    marginTop: Spacing.xl,
    lineHeight: 18,
  },
});
