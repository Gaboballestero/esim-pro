import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      // Reset the navigation stack and go to Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error setting first launch:', error);
      // Fallback navigation
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Logo/Icon Area */}
          <View style={styles.logoContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="phone-portrait" size={80} color={COLORS.surface} />
            </View>
            <Text style={styles.logoText}>eSIM Pro</Text>
            <Text style={styles.tagline}>Conectividad global instantánea</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.demoModeContainer}>
              <Ionicons name="flask" size={20} color={COLORS.warning} />
              <Text style={styles.demoModeText}>Modo Demo - Sin conexión al servidor</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="flash" size={24} color={COLORS.surface} />
              <Text style={styles.featureText}>Activación instantánea</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="globe" size={24} color={COLORS.surface} />
              <Text style={styles.featureText}>Cobertura mundial</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.surface} />
              <Text style={styles.featureText}>Seguro y confiable</Text>
            </View>
          </View>

          {/* CTA Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Comenzar</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    justifyContent: 'space-between',
    paddingTop: height * 0.1,
    paddingBottom: height * 0.05,
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  featuresContainer: {
    marginVertical: 40,
  },
  demoModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  demoModeText: {
    fontSize: 14,
    color: COLORS.warning,
    marginLeft: 8,
    fontWeight: '600',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.surface,
    marginLeft: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
    width: width * 0.8,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 8,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
