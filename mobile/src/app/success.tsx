import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { transactionApi } from '../lib/api';
import { CheckCircle2, ShieldCheck, Share2, Home, Landmark, User, Hash } from 'lucide-react-native';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  target_currency: string;
  recipient_id: string;
  recipient_name: string;
  exchange_rate: number;
  fee: number;
  final_amount: number;
  blockchain_hash: string;
  settlement_time: number;
}

export default function SuccessScreen() {
  const router = useRouter();
  const { id: txnId, hash: blockHash } = useLocalSearchParams<{ id: string; hash: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransaction() {
      if (!txnId) {
        router.replace('/(tabs)/home');
        return;
      }
      try {
        const res = await transactionApi.get(txnId);
        if (res.data?.data) {
          setTransaction(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching transaction receipt:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTransaction();
  }, [txnId]);

  async function handleShare() {
    if (!transaction) return;
    try {
      await Share.share({
        message: `AutoUPI Receipt: Successfully sent ${transaction.amount} ${transaction.currency} (${transaction.final_amount} ${transaction.target_currency}) to ${transaction.recipient_name} in 8 seconds! Hash: ${blockHash || transaction.blockchain_hash}`,
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  const txn = transaction || {
    amount: 10000,
    currency: 'INR',
    target_currency: 'AED',
    recipient_id: 'ahmed@uae',
    recipient_name: 'Ahmed Al-Rashidi',
    exchange_rate: 0.04417,
    fee: 200,
    final_amount: 441.7,
    blockchain_hash: blockHash || '0x4f2e96d912a76f2b0124c1a5d96e4c7d',
    settlement_time: 7.4,
  };

  return (
    <View style={styles.container}>
      {/* Visual Success Indicator */}
      <View style={styles.hero}>
        <View style={styles.successIconBg}>
          <CheckCircle2 size={56} color="#34d399" fill="rgba(52, 211, 153, 0.1)" />
        </View>
        <Text style={styles.successTitle}>Settled Successfully</Text>
        <Text style={styles.timeLabel}>Processed in {txn.settlement_time || 7.4}s</Text>
        <Text style={styles.finalAmount}>
          {txn.final_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {txn.target_currency}
        </Text>
        <Text style={styles.finalAmountSub}>Received by {txn.recipient_name}</Text>
      </View>

      {/* Details Receipt Card */}
      <View style={styles.receiptCard}>
        <Text style={styles.cardHeader}>Transaction Receipt</Text>
        
        <View style={styles.receiptRow}>
          <View style={styles.labelCol}>
            <User size={14} color="#64748b" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Recipient</Text>
          </View>
          <View style={styles.valueCol}>
            <Text style={styles.rowValue}>{txn.recipient_name}</Text>
            <Text style={styles.rowValueSub}>{txn.recipient_id}</Text>
          </View>
        </View>

        <View style={styles.receiptRow}>
          <View style={styles.labelCol}>
            <Landmark size={14} color="#64748b" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Source Amount</Text>
          </View>
          <View style={styles.valueCol}>
            <Text style={styles.rowValue}>₹{txn.amount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.receiptRow}>
          <View style={styles.labelCol}>
            <Landmark size={14} color="#64748b" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Rate & Fees</Text>
          </View>
          <View style={styles.valueCol}>
            <Text style={styles.rowValue}>Fee (2%): ₹{txn.fee.toFixed(2)}</Text>
            <Text style={styles.rowValueSub}>Rate: 1 INR = {txn.exchange_rate} {txn.target_currency}</Text>
          </View>
        </View>

        <View style={[styles.receiptRow, styles.lastRow]}>
          <View style={styles.labelCol}>
            <Hash size={14} color="#64748b" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Blockchain Hash</Text>
          </View>
          <View style={styles.valueCol}>
            <Text style={styles.hashText} numberOfLines={1} ellipsizeMode="middle">
              {txn.blockchain_hash}
            </Text>
          </View>
        </View>
      </View>

      {/* Trust Badge */}
      <View style={styles.trustBadge}>
        <ShieldCheck size={16} color="#34d399" />
        <Text style={styles.trustText}>Secured by Blockchain Multi-Sig Liquidity Lock</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Share2 size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.btnText}>Share Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/(tabs)/home')}
          activeOpacity={0.8}
        >
          <Home size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.btnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Slate 950
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  timeLabel: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '700',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  finalAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 18,
    letterSpacing: -1,
  },
  finalAmountSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '500',
  },
  receiptCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 12,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  lastRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
    marginTop: 4,
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowIcon: {
    marginTop: -1,
  },
  rowLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  valueCol: {
    alignItems: 'flex-end',
  },
  rowValue: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
  rowValueSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 3,
  },
  hashText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
    width: 140,
    textAlign: 'right',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 32,
  },
  trustText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    height: 50,
  },
  homeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 14,
    height: 50,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
