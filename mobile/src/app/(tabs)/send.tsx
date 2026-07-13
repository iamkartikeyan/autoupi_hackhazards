import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { transactionApi } from '../../lib/api';
import { ArrowLeftRight, Shield, Globe, Landmark, User, CreditCard } from 'lucide-react-native';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', flag: '🇦🇪', name: 'UAE Dirham' },
  { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'Pound Sterling' },
];

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

const QUICK_RECIPIENTS = [
  { id: 'ahmed@uae', name: 'Ahmed Al-Rashidi', flag: '🇦🇪' },
  { id: 'john@uk', name: 'John Smith', flag: '🇬🇧' },
  { id: 'sarah@us', name: 'Sarah Johnson', flag: '🇺🇸' },
];

const RATES: Record<string, Record<string, number>> = {
  INR: { AED: 0.04417, USD: 0.012, EUR: 0.011, GBP: 0.0094, INR: 1 },
  AED: { INR: 22.64, USD: 0.2723, EUR: 0.2499, GBP: 0.2128, AED: 1 },
  USD: { INR: 83.12, AED: 3.673, EUR: 0.918, GBP: 0.782, USD: 1 },
};

const FEE_PERCENT = 0.02;

export default function SendScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('10000');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('AED');
  const [recipientId, setRecipientId] = useState('ahmed@uae');
  const [recipientName, setRecipientName] = useState('Ahmed Al-Rashidi');
  const [loading, setLoading] = useState(false);

  const rawAmount = parseFloat(amount) || 0;
  const rate = RATES[fromCurrency]?.[toCurrency] || 0.04417;
  const fee = Math.round(rawAmount * FEE_PERCENT * 100) / 100;
  const converted = Math.round(rawAmount * rate * 100) / 100;
  const totalDebit = rawAmount + fee;

  async function handleSend() {
    if (rawAmount < 100) {
      Alert.alert('Error', 'Minimum amount is ₹100');
      return;
    }
    if (!recipientId) {
      Alert.alert('Error', 'Please enter a recipient ID');
      return;
    }
    if (!recipientName) {
      Alert.alert('Error', 'Please enter a recipient name');
      return;
    }

    setLoading(true);
    try {
      const res = await transactionApi.initiate({
        amount: rawAmount,
        currency: fromCurrency,
        targetCurrency: toCurrency,
        recipientId,
        recipientName,
      });
      const { transactionId } = res.data.data;
      router.push(`/process?id=${transactionId}`);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Transaction Failed', err.response?.data?.error || 'Failed to initiate transaction');
    } finally {
      setLoading(false);
    }
  }

  function swapCurrencies() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  function selectRecipient(rec: typeof QUICK_RECIPIENTS[0]) {
    setRecipientId(rec.id);
    setRecipientName(rec.name);
    
    // Set target currency based on recipient ID handle
    if (rec.id.endsWith('@uae')) setToCurrency('AED');
    else if (rec.id.endsWith('@uk')) setToCurrency('GBP');
    else if (rec.id.endsWith('@us')) setToCurrency('USD');
  }

  const fromInfo = CURRENCIES.find(c => c.code === fromCurrency)!;
  const toInfo = CURRENCIES.find(c => c.code === toCurrency)!;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      {/* Title */}
      <Text style={styles.title}>Send Money International</Text>
      <Text style={styles.subtitle}>Cross-border payments settled in seconds with a flat 2% fee.</Text>

      {/* Currency Transfer Card */}
      <View style={styles.transferCard}>
        {/* Source Currency */}
        <View style={styles.currencyRow}>
          <View style={styles.currencySelector}>
            <Text style={styles.flagText}>{fromInfo.flag}</Text>
            <Text style={styles.currencyCode}>{fromCurrency}</Text>
          </View>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>{fromInfo.symbol}</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="#475569"
            />
          </View>
        </View>

        {/* Divider / Swap Icon */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
            <ArrowLeftRight size={18} color="#3b82f6" />
          </TouchableOpacity>
          <View style={styles.line} />
        </View>

        {/* Target Currency */}
        <View style={styles.currencyRow}>
          <View style={styles.currencySelector}>
            <Text style={styles.flagText}>{toInfo.flag}</Text>
            <Text style={styles.currencyCode}>{toCurrency}</Text>
          </View>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>{toInfo.symbol}</Text>
            <Text style={styles.convertedValue}>
              {converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Amount Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAmountList} contentContainerStyle={styles.quickAmountContainer}>
        {QUICK_AMOUNTS.map((val) => (
          <TouchableOpacity
            key={val}
            style={styles.quickAmountBtn}
            onPress={() => setAmount(val.toString())}
          >
            <Text style={styles.quickAmountText}>+{fromInfo.symbol}{val.toLocaleString('en-IN')}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Conversion Rate Card */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Exchange Rate</Text>
          <Text style={styles.breakdownValue}>1 {fromCurrency} = {rate} {toCurrency}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>AutoUPI Transfer Fee (2%)</Text>
          <Text style={styles.breakdownValue}>+{fromInfo.symbol}{fee.toFixed(2)}</Text>
        </View>
        <View style={[styles.breakdownRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total to Pay</Text>
          <Text style={styles.totalValue}>{fromInfo.symbol}{totalDebit.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Recipient Details Section */}
      <Text style={styles.sectionTitle}>Recipient Details</Text>
      <View style={styles.recipientCard}>
        <Text style={styles.label}>Recipient UPI Handle ID</Text>
        <View style={styles.inputContainer}>
          <Globe size={18} color="#94a3b8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="recipient@country"
            placeholderTextColor="#64748b"
            value={recipientId}
            onChangeText={setRecipientId}
            autoCapitalize="none"
          />
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Recipient Full Name</Text>
        <View style={styles.inputContainer}>
          <User size={18} color="#94a3b8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Recipient's Name"
            placeholderTextColor="#64748b"
            value={recipientName}
            onChangeText={setRecipientName}
          />
        </View>
      </View>

      {/* Quick Recipients */}
      <Text style={styles.sectionTitle}>Quick Transfer Contacts</Text>
      <View style={styles.recipientsRow}>
        {QUICK_RECIPIENTS.map((rec) => (
          <TouchableOpacity
            key={rec.id}
            style={[styles.quickRecBtn, recipientId === rec.id && styles.quickRecBtnActive]}
            onPress={() => selectRecipient(rec)}
          >
            <Text style={styles.quickRecFlag}>{rec.flag}</Text>
            <Text style={styles.quickRecName} numberOfLines={1}>{rec.name.split(' ')[0]}</Text>
            <Text style={styles.quickRecHandle}>{rec.id}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Initiate Transfer Button */}
      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSend}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <View style={styles.btnContent}>
            <Shield size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.sendButtonText}>Pay Securely Now</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Slate 950
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  transferCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    marginBottom: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  flagText: {
    fontSize: 16,
  },
  currencyCode: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  currencySymbol: {
    fontSize: 24,
    color: '#94a3b8',
    fontWeight: '600',
    marginRight: 4,
  },
  amountInput: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'right',
    minWidth: 100,
    padding: 0,
  },
  convertedValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'right',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickAmountList: {
    marginBottom: 20,
  },
  quickAmountContainer: {
    gap: 10,
  },
  quickAmountBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickAmountText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 14,
    color: '#34d399',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recipientCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  recipientsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  quickRecBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    alignItems: 'center',
  },
  quickRecBtnActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  quickRecFlag: {
    fontSize: 22,
    marginBottom: 6,
  },
  quickRecName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  quickRecHandle: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 4,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
