import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import HablarisLogoOnly from '../components/HablarisLogoOnly';
import { SocialAuthSection } from '../components/SocialAuthButton';
import { useAuth } from '../contexts/AuthContext';
import OAuthService from '../services/OAuthService';
import ShopService from '../services/ShopService';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
    checkAppleSignInAvailability();
  }, []);

  const checkAppleSignInAvailability = async () => {
    const isAvailable = await OAuthService.isAppleSignInAvailable();
    setShowAppleSignIn(isAvailable);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      
      if (success) {
        // Verificar si hay una redirección pendiente al carrito
        const hasPendingCartRedirect = ShopService.getPendingCartRedirect();
        
        if (hasPendingCartRedirect) {
          // Limpiar la bandera y redirigir al carrito
          ShopService.clearPendingCartRedirect();
          
          Alert.alert(
            '¡Bienvenido!',
            'Inicio de sesión exitoso. Te llevamos a completar tu compra.',
            [
              {
                text: 'Ir al Carrito',
                onPress: () => navigation.navigate('Checkout', { plan: null }),
              },
            ]
          );
        } else {
          // Comportamiento normal - redirigir automáticamente a las pestañas principales
          Alert.alert(
            '¡Bienvenido!',
            'Inicio de sesión exitoso',
            [
              {
                text: 'Continuar',
                onPress: () => navigation.navigate('Main'),
              },
            ]
          );
        }
      } else {
        Alert.alert('Error', 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      
      if (success) {
        // Verificar si hay una redirección pendiente al carrito
        const hasPendingCartRedirect = ShopService.getPendingCartRedirect();
        
        if (hasPendingCartRedirect) {
          // Limpiar la bandera y redirigir al carrito
          ShopService.clearPendingCartRedirect();
          
          Alert.alert(
            '¡Bienvenido!',
            'Autenticación exitosa. Te llevamos a completar tu compra.',
            [
              {
                text: 'Ir al Carrito',
                onPress: () => navigation.navigate('Checkout', { plan: null }),
              },
            ]
          );
        } else {
          // Comportamiento normal
          Alert.alert(
            '¡Bienvenido!',
            'Autenticación exitosa con Google',
            [
              {
                text: 'Volver al Shop',
                style: 'cancel',
                onPress: () => navigation.navigate('Shop'),
              },
              {
                text: 'Mi Cuenta',
                onPress: () => navigation.navigate('Main'),
              },
            ]
          );
        }
      } else {
        Alert.alert('Error', 'No se pudo autenticar con Google');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado con Google Sign In');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const success = await loginWithApple();
      
      if (success) {
        // Verificar si hay una redirección pendiente al carrito
        const hasPendingCartRedirect = ShopService.getPendingCartRedirect();
        
        if (hasPendingCartRedirect) {
          // Limpiar la bandera y redirigir al carrito
          ShopService.clearPendingCartRedirect();
          
          Alert.alert(
            '¡Bienvenido!',
            'Autenticación exitosa. Te llevamos a completar tu compra.',
            [
              {
                text: 'Ir al Carrito',
                onPress: () => navigation.navigate('Checkout', { plan: null }),
              },
            ]
          );
        } else {
          // Comportamiento normal
          Alert.alert(
            '¡Bienvenido!',
            'Autenticación exitosa con Apple',
            [
              {
                text: 'Volver al Shop',
                style: 'cancel',
                onPress: () => navigation.navigate('Shop'),
              },
              {
                text: 'Mi Cuenta',
                onPress: () => navigation.navigate('Main'),
              },
            ]
          );
        }
      } else {
        Alert.alert('Error', 'No se pudo autenticar con Apple');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado con Apple Sign In');
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Logo y título */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <HablarisLogoOnly size={35} speed={1.5} />
            </View>
            
            <Text style={styles.title}>Login Your Account</Text>
            <Text style={styles.subtitle}>
              Welcome back! Please enter your details
            </Text>
          </View>

          {/* Social Auth Section */}
          <SocialAuthSection
            onGooglePress={handleGoogleSignIn}
            onApplePress={handleAppleSignIn}
            googleLoading={googleLoading}
            appleLoading={appleLoading}
            showApple={showAppleSignIn}
          />

          {/* Email Login Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.gray[500]} />
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={COLORS.gray[500]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray[500]} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={COLORS.gray[500]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.gray[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => {/* Navegar a recuperar contraseña */}}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleEmailLogin}
              disabled={loading || googleLoading || appleLoading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.loginButtonGradient}
              >
                {loading ? (
                  <Text style={styles.loginButtonText}>Iniciando sesión...</Text>
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpSection}>
            <Text style={styles.signUpText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>

          {/* Back to Shop Link */}
          <TouchableOpacity 
            style={styles.backToShopButton}
            onPress={() => navigation.navigate('Shop')}
          >
            <Ionicons name="storefront-outline" size={16} color={COLORS.gray[600]} />
            <Text style={styles.backToShopText}>Volver al Shop</Text>
          </TouchableOpacity>
        </Animated.ScrollView>
        
        {/* Botón flotante de retroceso */}
        <Animated.View 
          style={[
            styles.floatingBackButton,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, 50, 100],
                outputRange: [0.3, 0.6, 0.9],
                extrapolate: 'clamp',
              }),
              transform: [{
                scale: scrollY.interpolate({
                  inputRange: [0, 50, 100],
                  outputRange: [0.8, 0.9, 1],
                  extrapolate: 'clamp',
                }),
              }],
            }
          ]}
        >
          <TouchableOpacity
            style={styles.floatingBackButtonTouchable}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.gray[700]} />
          </TouchableOpacity>
        </Animated.View>
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.md, // Reducido de xl a md
  },
  logoContainer: {
    marginBottom: SPACING.sm, // Reducido de lg a sm
  },
  logo: {
    width: 60, // Reducido de 80 a 60
    height: 60, // Reducido de 80 a 60
    borderRadius: 30, // Ajustado proporcionalmente
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22, // Reducido para ser más compacto
    fontWeight: '700',
    color: COLORS.gray[900],
    textAlign: 'center',
    marginBottom: SPACING.xs, // Reducido de sm a xs
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm, // Reducido de md a sm
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 20, // Reducido de 22 a 20
  },
  formSection: {
    marginTop: SPACING.md, // Reducido de lg a md
  },
  inputGroup: {
    marginBottom: SPACING.md, // Reducido de lg a md
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[900],
    marginLeft: SPACING.sm,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  signUpText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
  },
  signUpLink: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  backToShopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  backToShopText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  floatingBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingBackButtonTouchable: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default LoginScreen;
