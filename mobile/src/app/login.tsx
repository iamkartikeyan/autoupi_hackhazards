import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authApi, saveAuthData } from '../lib/api';
import { Zap, Phone, Mail, User, ShieldAlert } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('+911234567890');
  const [email, setEmail] = useState('demo@autoupi.com');
  const [fullName, setFullName] = useState('Demo User');
  const [otp, setOtp] = useState('');
  
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSendOTP() {
    if (!phone) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await authApi.requestOTP(phone, email);
      setStep('verify');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (!otp) {
      setErrorMsg('Please enter the OTP');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await authApi.verifyOTP(phone, email, fullName, otp);
      const { token, user } = res.data.data;
      await saveAuthData(token, user);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Zap size={32} color="#3b82f6" fill="#3b82f6" />
          </View>
          <Text style={styles.appName}>AutoUPI</Text>
          <Text style={styles.tagline}>Cross-Border Payments in 8 Seconds</Text>
        </View>

        {/* Demo Credentials Alert Banner */}
        <View style={styles.demoBanner}>
          <ShieldAlert size={18} color="#f59e0b" style={styles.demoIcon} />
          <View style={styles.demoTextContainer}>
            <Text style={styles.demoTitle}>Demo Environment Active</Text>
            <Text style={styles.demoText}>Phone: +911234567890</Text>
            <Text style={styles.demoText}>OTP Code: 123456</Text>
          </View>
        </View>

        {/* Auth Input Card */}
        <View style={styles.card}>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {step === 'request' ? (
            <View style={styles.form}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Phone size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+919876543210"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  editable={!loading}
                />
              </View>

              <Text style={styles.label}>Email Address (Optional)</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>

              <Text style={styles.label}>Full Name (For registration)</Text>
              <View style={styles.inputContainer}>
                <User size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#64748b"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleSendOTP}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Get Verification Code</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.verifyPrompt}>
                Enter the 6-digit code sent to {phone}
              </Text>

              <Text style={styles.label}>OTP Code</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="123456"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  editable={!loading}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyOTP}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('request')}
                disabled={loading}
              >
                <Text style={styles.backButtonText}>Change Phone Number</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Slate 950
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },
  demoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  demoIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  demoTextContainer: {
    flex: 1,
  },
  demoTitle: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  demoText: {
    color: '#d97706',
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#0f172a', // Slate 900
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617', // Slate 950
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 8,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#2563eb', // Blue 600
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  verifyPrompt: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
});
