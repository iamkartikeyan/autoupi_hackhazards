import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getStoredUser, clearAuth, transactionApi, authApi } from '../../lib/api';
import {
  Zap,
  ArrowUpRight,
  Plus,
  QrCode,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';

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

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      // Get stored user or fetch fresh user data
      const stored = await getStoredUser();
      if (stored) {
        setUser(stored);
      }
      
      const userRes = await authApi.getMe();
      if (userRes.data?.data) {
        setUser(userRes.data.data);
      }

      // Fetch transaction history
      const txRes = await transactionApi.getHistory(1, 5);
      if (txRes.data?.data?.transactions) {
        setTransactions(txRes.data.data.transactions);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  async function handleLogout() {
    await clearAuth();
    router.replace('/login');
  }

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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
    >
      {/* Navbar Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name || 'AutoUPI User'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#f87171" />
        </TouchableOpacity>
      </View>

      {/* Main Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.logoRow}>
            <Zap size={22} color="#ffffff" fill="#ffffff" />
            <Text style={styles.cardName}>AutoUPI Wallet</Text>
          </View>
          <Text style={styles.cardTag}>ACTIVE</Text>
        </View>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>
          ₹{(user?.wallet_balance || 50000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.phoneText}>{user?.phone || '+91 99999 99999'}</Text>
          <Text style={styles.networkText}>SEPA · UPI · Blockchain</Text>
        </View>
      </View>

      {/* Action Buttons Grid */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => router.push('/(tabs)/send')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <ArrowUpRight size={22} color="#3b82f6" />
          </View>
          <Text style={styles.actionText}>Send Money</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]}>
            <Plus size={22} color="#34d399" />
          </View>
          <Text style={styles.actionText}>Add Funds</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(167, 139, 250, 0.1)' }]}>
            <QrCode size={22} color="#a78bfa" />
          </View>
          <Text style={styles.actionText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions List Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={40} color="#475569" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>No recent transactions found.</Text>
          <Text style={styles.emptySubText}>Initiate a transfer to see it here.</Text>
        </View>
      ) : (
        <View style={styles.transactionList}>
          {transactions.map((item) => {
            const statusConfig = getStatusStyle(item.status);
            const StatusIcon = statusConfig.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.transactionItem}
                onPress={() => router.push(`/process?id=${item.id}`)}
              >
                <View style={styles.txIconContainer}>
                  <View style={[styles.statusIconBg, { backgroundColor: statusConfig.bg }]}>
                    <StatusIcon size={16} color={statusConfig.color} />
                  </View>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName}>{item.recipient_name}</Text>
                  <Text style={styles.txMeta}>
                    to: {item.recipient_id} · {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.txAmountContainer}>
                  <Text style={styles.txAmount}>
                    -₹{item.amount.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.txTargetAmount, { color: statusConfig.color }]}>
                    {item.final_amount} {item.target_currency}
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
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '700',
    marginTop: 2,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.15)',
  },
  balanceCard: {
    backgroundColor: '#2563eb', // Solid Blue-600 background (gradients are supported via expo-linear-gradient, using rich blue for simplicity and compatibility)
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardTag: {
    fontSize: 10,
    color: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginVertical: 8,
    letterSpacing: -0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  phoneText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  networkText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  actionItem: {
    flex: 1,
    backgroundColor: '#0f172a', // Slate 900
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  transactionList: {
    gap: 12,
    marginBottom: 40,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
  },
  txIconContainer: {
    marginRight: 12,
  },
  statusIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  txMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  txTargetAmount: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 40,
    marginBottom: 40,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
});
