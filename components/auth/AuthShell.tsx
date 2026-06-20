import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { type ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  eyebrow?: string;
  onBack?: () => void;
};

export function AuthShell({ title, subtitle, children, eyebrow = 'BabyOi', onBack }: AuthShellProps) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.accentBar, styles.accentBarPink]} />
        <View style={[styles.accentBar, styles.accentBarYellow]} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            {onBack ? (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="chevron-back" size={20} color="#5C7A8A" />
                <Text style={styles.backText}>Quay lại</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
          </View>

          <View style={styles.brandBlock}>
            <LinearGradient colors={['#FFFFFF', '#FFF3F7', '#EFFBFF']} style={styles.logoFrame}>
              <View style={styles.logoSparkleLeft}>
                <Ionicons name="sparkles" size={14} color="#FFD166" />
              </View>
              <View style={styles.logoSparkleRight}>
                <Ionicons name="heart" size={13} color="#FF8FAB" />
              </View>
              <Image source={require('../../assets/images/logo1.png')} style={styles.logo} />
            </LinearGradient>
            <View style={styles.eyebrowPill}>
              <Ionicons name="sparkles-outline" size={14} color="#FF8FAB" />
              <Text style={styles.eyebrow}>{eyebrow}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <LinearGradient colors={['#FFFFFF', '#FFF9FC', '#F1FCFF']} style={styles.formPanel}>
            <View style={styles.formAccentLine} />
            {children}
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

export const authStyles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#5C7A8A',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#FFFDFE',
    borderColor: '#FFE0EA',
    borderRadius: 18,
    borderWidth: 1.5,
    color: '#334455',
    fontSize: 16,
    fontWeight: '700',
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  otpInput: {
    color: '#FF6F9B',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  errorText: {
    color: '#D64545',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 2,
    marginTop: 7,
  },
  formErrorText: {
    backgroundColor: '#FFF1F4',
    borderColor: '#FFD2DE',
    borderRadius: 16,
    borderWidth: 1,
    color: '#D64545',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#FF6F9B',
    borderColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 22,
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 54,
    shadowColor: '#FF6F9B',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 7,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    marginTop: -4,
  },
  linkText: {
    color: '#FF6F9B',
    fontSize: 14,
    fontWeight: '900',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginVertical: 18,
  },
  dividerLine: {
    backgroundColor: '#E9EEF2',
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: '#7D95A1',
    fontSize: 13,
    fontWeight: '900',
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDF5FB',
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  socialButtonText: {
    color: '#405665',
    fontSize: 15,
    fontWeight: '900',
  },
  promptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 18,
  },
  promptText: {
    color: '#5C7A8A',
    fontSize: 14,
    fontWeight: '700',
  },
  promptLink: {
    color: '#FF6F9B',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    marginTop: 14,
    minHeight: 36,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FF6F9B',
    fontSize: 14,
    fontWeight: '900',
  },
  mutedLink: {
    color: '#5C7A8A',
    fontSize: 14,
    fontWeight: '800',
  },
  dangerLink: {
    color: '#D64545',
    fontSize: 14,
    fontWeight: '900',
  },
  emailBadge: {
    alignSelf: 'center',
    backgroundColor: '#EFFBFE',
    borderColor: '#DDF5FB',
    borderRadius: 18,
    borderWidth: 1,
    color: '#405665',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  stepChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E6EEF2',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  stepChipActive: {
    backgroundColor: '#FFF1C9',
    borderColor: '#FFB6C1',
  },
  stepText: {
    color: '#7D95A1',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  stepTextActive: {
    color: '#FF6F9B',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F3',
  },
  safeArea: {
    flex: 1,
  },
  accentBar: {
    position: 'absolute',
    borderRadius: 999,
  },
  accentBarPink: {
    top: 76,
    left: 22,
    width: 86,
    height: 10,
    backgroundColor: '#FFB6C1',
    transform: [{ rotate: '-8deg' }],
  },
  accentBarYellow: {
    top: 166,
    left: 56,
    width: 58,
    height: 8,
    backgroundColor: '#FFD166',
    transform: [{ rotate: '6deg' }],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 28,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  topRow: {
    minHeight: 38,
    justifyContent: 'center',
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#DDF5FB',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 10,
  },
  backText: {
    color: '#5C7A8A',
    fontSize: 13,
    fontWeight: '900',
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoFrame: {
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 2,
    height: 88,
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#FF8FAB',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    width: 88,
    elevation: 6,
  },
  logoSparkleLeft: {
    position: 'absolute',
    left: -9,
    top: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 5,
  },
  logoSparkleRight: {
    position: 'absolute',
    right: -8,
    bottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 5,
  },
  logo: {
    height: 66,
    width: 66,
  },
  eyebrowPill: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#FFE5EC',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eyebrow: {
    color: '#FF6F9B',
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    color: '#FF6F9B',
    fontSize: 29,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#5C7A8A',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    maxWidth: 310,
    textAlign: 'center',
  },
  formPanel: {
    borderColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 2,
    overflow: 'hidden',
    padding: 18,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 7,
  },
  formAccentLine: {
    alignSelf: 'center',
    backgroundColor: '#FFD166',
    borderRadius: 999,
    height: 5,
    marginBottom: 16,
    width: 56,
  },
});
