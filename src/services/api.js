// ─────────────────────────────────────────────────────────────
//  RaPaX™ Mobile — API Service
// ─────────────────────────────────────────────────────────────
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_URL    = '@rapax_api_url';
const STORAGE_KEY_SECRET = '@rapax_operator_secret';
const STORAGE_KEY_TOKEN  = '@rapax_operator_token';

// ── Config ────────────────────────────────────────────────────
let _baseUrl = 'http://localhost:4000/api';
let _secret  = '';
let _token   = null;

export async function loadConfig() {
  const [url, secret, token] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEY_URL),
    AsyncStorage.getItem(STORAGE_KEY_SECRET),
    AsyncStorage.getItem(STORAGE_KEY_TOKEN),
  ]);
  if (url)    _baseUrl = url;
  if (secret) _secret  = secret;
  if (token)  _token   = token;
}

export async function saveConfig({ apiUrl, operatorSecret }) {
  _baseUrl = apiUrl;
  _secret  = operatorSecret;
  await AsyncStorage.multiSet([
    [STORAGE_KEY_URL,    apiUrl],
    [STORAGE_KEY_SECRET, operatorSecret],
  ]);
}

export async function clearConfig() {
  _token   = null;
  _baseUrl = 'http://localhost:4000/api';
  _secret  = '';
  await AsyncStorage.multiRemove([STORAGE_KEY_URL, STORAGE_KEY_SECRET, STORAGE_KEY_TOKEN]);
}

export function getBaseUrl() { return _baseUrl; }
export function hasConfig()  { return !!_secret; }

// ── Operator auth ─────────────────────────────────────────────
export async function operatorLogin() {
  const res = await axios.post(`${_baseUrl}/operator/login`, { secret: _secret });
  _token = res.data.token;
  await AsyncStorage.setItem(STORAGE_KEY_TOKEN, _token);
  return _token;
}

export async function getToken() {
  if (_token) return _token;
  return operatorLogin();
}

function authHeader() {
  return { Authorization: `Bearer ${_token}` };
}

async function authedGet(path) {
  await getToken();
  return axios.get(`${_baseUrl}${path}`, { headers: authHeader() });
}

async function authedPost(path, data) {
  await getToken();
  return axios.post(`${_baseUrl}${path}`, data, { headers: authHeader() });
}

async function authedPatch(path, data) {
  await getToken();
  return axios.patch(`${_baseUrl}${path}`, data, { headers: authHeader() });
}

// ── Public API ────────────────────────────────────────────────
export async function listProducts() {
  const res = await axios.get(`${_baseUrl}/products`);
  return res.data.products || [];
}

export async function getProduct(id) {
  const res = await axios.get(`${_baseUrl}/product/${id}`);
  return res.data.product;
}

export async function initiatePurchase({ productId, currency, buyerWallet }) {
  const res = await axios.post(`${_baseUrl}/purchase/initiate`, {
    product_id:   productId,
    currency:     currency.toUpperCase(),
    buyer_wallet: buyerWallet || null,
  });
  return res.data;
}

export async function getPurchaseStatus(transactionId) {
  const res = await axios.get(`${_baseUrl}/purchase/status/${transactionId}`);
  return res.data;
}

// ── Operator API ──────────────────────────────────────────────
export async function getAllProducts() {
  const res = await authedGet('/operator/products');
  return res.data.products || [];
}

export async function uploadProduct(formData) {
  await getToken();
  const res = await axios.post(`${_baseUrl}/operator/products`, formData, {
    headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
  });
  return res.data.product;
}

export async function updateProduct(id, fields) {
  const res = await authedPatch(`/operator/products/${id}`, fields);
  return res.data.product;
}

export async function toggleProduct(id) {
  const res = await authedPatch(`/operator/products/${id}/toggle`);
  return res.data.product;
}

export async function getTransactions(limit = 50) {
  const res = await authedGet(`/operator/transactions?limit=${limit}`);
  return res.data.transactions || [];
}

export async function getDeliveries(limit = 50) {
  const res = await authedGet(`/operator/deliveries?limit=${limit}`);
  return res.data.deliveries || [];
}

export async function getAuditLogs(limit = 50, eventType = '') {
  const q = eventType ? `?limit=${limit}&event_type=${eventType}` : `?limit=${limit}`;
  const res = await authedGet(`/operator/logs${q}`);
  return res.data.logs || [];
}

export async function confirmPayment({ transactionId, txHash, amountReceived }) {
  const res = await authedPost('/internal/payment/confirm', {
    transaction_id:  transactionId,
    tx_hash:         txHash,
    amount_received: amountReceived,
  });
  return res.data;
}

export async function exportJson() {
  await getToken();
  const res = await axios.get(`${_baseUrl}/operator/export/json`, {
    headers: authHeader(),
  });
  return res.data;
}
