import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getSocket, disconnectSocket, transactionApi } from '../lib/api';
import {
  Shield,
  Lock,
  Database,
  Rocket,
  Bell,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Terminal,
} from 'lucide-react-native';

const STEP_ICONS: Record<string, React.ElementType> = {
  kyc: Shield,
  aml: Shield,
  rate_lock: Lock,
  liquidity: Database,
  settlement: Rocket,
  notify: Bell,
};

interface StepLog {
  step: string;
  status: string;
  message: string;
  timestamp: string;
}

interface StepState {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'done' | 'error';
}

const STEPS_META = [
  { id: 'kyc', name: 'KYC Verification' },
  { id: 'aml', name: 'AML Compliance Check' },
  { id: 'rate_lock', name: 'Exchange Rate Lock' },
  { id: 'liquidity', name: 'Liquidity Pool Check' },
  { id: 'settlement', name: 'Cross-Border Settlement' },
  { id: 'notify', name: 'Recipient Notification' },
];

export default function ProcessScreen() {
  const router = useRouter();
  const { id: txnId } = useLocalSearchParams<{ id: string }>();

  const [steps, setSteps] = useState<StepState[]>(
    STEPS_META.map((s) => ({ ...s, status: 'pending' }))
  );
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<'processing' | 'complete' | 'failed'>('processing');
  const [hash, setHash] = useState('');
  const [progress, setProgress] = useState(0);

  const logsScrollViewRef = useRef<ScrollView | null>(null);
  const timerRef = useRef<any>(null);

  // Prevent hardware back button on Android during transaction processing
  useEffect(() => {
    const backAction = () => {
      if (status === 'processing') {
        // Disable back press
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [status]);

  useEffect(() => {
    if (!txnId) {
      router.replace('/(tabs)/send');
      return;
    }

    const socket = getSocket();
    socket.connect();

    socket.on('connect', () => {
      socket.emit('join_transaction', txnId);
      addLog('system', 'INFO', 'Connected to secure settlement network');
      addLog('system', 'INFO', `Transaction ID: ${txnId}`);
    });

    socket.on('txn_status', ({ status: s }: { status: string }) => {
      if (s === 'PROCESSING') {
        timerRef.current = setInterval(() => {
          setElapsed((e) => e + 100);
        }, 100);
      }
    });

    socket.on('txn_log', (data: StepLog) => {
      addLog(data.step, data.status, data.message);
      
      if (data.status === 'INFO') {
        setSteps((prev) =>
          prev.map((s) => (s.id === data.step ? { ...s, status: 'processing' } : s))
        );
      } else if (data.status === 'SUCCESS') {
        setSteps((prev) => {
          const updated = prev.map((s) =>
            s.id === data.step ? { ...s, status: 'done' as const } : s
          );
          const doneCount = updated.filter((s) => s.status === 'done').length;
          setProgress((doneCount / STEPS_META.length) * 100);
          return updated;
        });
      }
    });

    socket.on('txn_complete', (data: { hash: string; timeTaken: string }) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setHash(data.hash);
      setStatus('complete');
      setProgress(100);
      addLog('system', 'SUCCESS', `Settlement complete! Hash: ${data.hash}`);
      
      setTimeout(() => {
        disconnectSocket();
        router.replace(`/success?id=${txnId}&hash=${encodeURIComponent(data.hash)}`);
      }, 2000);
    });

    socket.on('txn_failed', () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('failed');
      addLog('system', 'ERROR', 'Transaction rejected by compliance rules.');
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      socket.off('connect');
      socket.off('txn_status');
      socket.off('txn_log');
      socket.off('txn_complete');
      socket.off('txn_failed');
      disconnectSocket();
    };
  }, [txnId, router]);

  function addLog(step: string, logStatus: string, message: string) {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLogs((prev) => [...prev, { step, status: logStatus, message, timestamp }]);
  }

  // Auto-scroll logs to bottom
  const handleLogsContentChange = () => {
    logsScrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const elapsedSec = (elapsed / 1000).toFixed(1);
  const completedSteps = steps.filter((s) => s.status === 'done').length;

  const logColor: Record<string, string> = {
    INFO: '#60a5fa',
    SUCCESS: '#34d399',
    WARN: '#fbbf24',
    ERROR: '#f87171',
  };

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.header}>
        {status !== 'processing' ? (
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backBtn}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderIcon} />
        )}
        <Text style={styles.headerTitle}>Settlement Protocol</Text>
        <View style={styles.badgeContainer}>
          {status === 'processing' ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          ) : status === 'complete' ? (
            <Text style={[styles.statusBadge, { color: '#34d399' }]}>SUCCESS</Text>
          ) : (
            <Text style={[styles.statusBadge, { color: '#f87171' }]}>FAILED</Text>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Hero Stats */}
      <View style={styles.heroStats}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>COMPLETED</Text>
          <Text style={styles.statValue}>
            {completedSteps} / {STEPS_META.length}
          </Text>
        </View>
        <View style={[styles.statBox, styles.borderLeft]}>
          <Text style={styles.statLabel}>ELAPSED TIME</Text>
          <Text style={styles.statValue}>{elapsedSec}s</Text>
        </View>
      </View>

      {/* Steps List */}
      <ScrollView style={styles.stepsScroll} contentContainerStyle={styles.stepsContainer}>
        {steps.map((stepItem, index) => {
          const StepIcon = STEP_ICONS[stepItem.id];
          const isDone = stepItem.status === 'done';
          const isProcessing = stepItem.status === 'processing';
          const isError = stepItem.status === 'error';

          return (
            <View key={stepItem.id} style={styles.stepRow}>
              {/* Connector line between icons */}
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    isDone ? styles.connectorDone : styles.connectorPending,
                  ]}
                />
              )}

              {/* Status Icon Indicator */}
              <View
                style={[
                  styles.iconOuter,
                  isDone
                    ? styles.iconOuterDone
                    : isProcessing
                    ? styles.iconOuterProcessing
                    : styles.iconOuterPending,
                ]}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : isDone ? (
                  <CheckCircle2 size={16} color="#34d399" fill="rgba(52, 211, 153, 0.1)" />
                ) : isError ? (
                  <XCircle size={16} color="#f87171" />
                ) : (
                  <StepIcon size={14} color="#64748b" />
                )}
              </View>

              <View style={styles.stepInfo}>
                <Text
                  style={[
                    styles.stepName,
                    isDone
                      ? styles.stepNameDone
                      : isProcessing
                      ? styles.stepNameActive
                      : styles.stepNamePending,
                  ]}
                >
                  {stepItem.name}
                </Text>
                <Text style={styles.stepStatusText}>
                  {isDone ? 'Completed' : isProcessing ? 'Processing...' : 'Pending'}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Terminal logs console */}
      <View style={styles.terminalContainer}>
        <View style={styles.terminalHeader}>
          <Terminal size={14} color="#94a3b8" />
          <Text style={styles.terminalTitle}>System Logs Console</Text>
        </View>
        <ScrollView
          ref={logsScrollViewRef}
          onContentSizeChange={handleLogsContentChange}
          style={styles.terminalScroll}
          contentContainerStyle={styles.terminalContent}
        >
          {logs.map((log, idx) => (
            <Text key={idx} style={styles.logLine}>
              <Text style={styles.logTime}>[{log.timestamp}] </Text>
              <Text style={[styles.logTag, { color: logColor[log.status] || '#ffffff' }]}>
                {log.status}:{' '}
              </Text>
              <Text style={styles.logMsg}>{log.message}</Text>
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Slate 950
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#0f172a',
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  placeholderIcon: {
    width: 36,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  badgeContainer: {
    width: 72,
    alignItems: 'flex-end',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
  },
  liveText: {
    fontSize: 9,
    color: '#60a5fa',
    fontWeight: '800',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#1e293b',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '800',
    marginTop: 4,
  },
  stepsScroll: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  stepsContainer: {
    paddingBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 24,
    zIndex: 1,
  },
  connectorDone: {
    backgroundColor: '#34d399',
  },
  connectorPending: {
    backgroundColor: '#1e293b',
  },
  iconOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: '#020617',
    borderWidth: 1,
  },
  iconOuterPending: {
    borderColor: '#1e293b',
    backgroundColor: '#020617',
  },
  iconOuterProcessing: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  iconOuterDone: {
    borderColor: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
  },
  stepInfo: {
    marginLeft: 14,
    justifyContent: 'center',
    height: 32,
  },
  stepName: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepNamePending: {
    color: '#475569',
  },
  stepNameActive: {
    color: '#3b82f6',
  },
  stepNameDone: {
    color: '#ffffff',
  },
  stepStatusText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  terminalContainer: {
    height: 200,
    backgroundColor: '#020617',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0f172a',
    gap: 8,
  },
  terminalTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  terminalScroll: {
    flex: 1,
    padding: 12,
  },
  terminalContent: {
    paddingBottom: 20,
  },
  logLine: {
    fontSize: 11,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginBottom: 4,
  },
  logTime: {
    color: '#475569',
  },
  logTag: {
    fontWeight: '700',
  },
  logMsg: {
    color: '#cbd5e1',
  },
});
