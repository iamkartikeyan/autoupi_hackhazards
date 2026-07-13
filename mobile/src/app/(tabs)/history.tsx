import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { transactionApi } from '../../lib/api';
import { Clock, CheckCircle, XCircle, ArrowDown } from 'lucide-react-native';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  target_currency: string;
  recipient_id: string;
  recipient_name: string;
  final_amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadHistory() {
    try {
      const res = await transactionApi.getHistory(1, 20);
      if (res.data?.data?.transactions) {
        setTransactions(res.data.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  function getStatusStyle(status: string) {
    switch (status) {
      case 'COMPLETED':
        return { color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', icon: CheckCircle };
      case 'PROCESSING':
      case 'PENDING':
        return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', icon: Clock };
      default:
        return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', icon: XCircle };
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
    >
      <Text style={styles.title}>Transactions History</Text>
      <Text style={styles.subtitle}>List of all international transfers and real-time processing statuses.</Text>

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={48} color="#475569" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No transactions found</Text>
          <Text style={styles.emptySubText}>Your transfers will appear here once initiated.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {transactions.map((item) => {
            const statusConfig = getStatusStyle(item.status);
            const StatusIcon = statusConfig.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.item}
                onPress={() => router.push(`/process?id=${item.id}`)}
              >
                <View style={styles.iconContainer}>
                  <View style={[styles.statusIconBg, { backgroundColor: statusConfig.bg }]}>
                    <StatusIcon size={18} color={statusConfig.color} />
                  </View>
                </View>
                
                <View style={styles.details}>
                  <Text style={styles.name}>{item.recipient_name}</Text>
                  <Text style={styles.idHandle}>{item.recipient_id}</Text>
                  <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString()} at{' '}
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View style={styles.values}>
                  <Text style={styles.sourceAmount}>-₹{item.amount.toLocaleString('en-IN')}</Text>
                  <Text style={[styles.targetAmount, { color: statusConfig.color }]}>
                    {item.final_amount} {item.target_currency}
                  </Text>
                  <Text style={[styles.statusBadge, { color: statusConfig.color, backgroundColor: statusConfig.bg }]}>
                    {item.status}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 60,
    marginTop: 20,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  list: {
    gap: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
  },
  iconContainer: {
    marginRight: 14,
  },
  statusIconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  idHandle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 3,
  },
  date: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 6,
  },
  values: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sourceAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  targetAmount: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    overflow: 'hidden',
  },
});
