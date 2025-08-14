import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { AuthService } from '../../services/AuthService';
import HablarisLogoOnly from '../../components/HablarisLogoOnly';
import { SocialAuthSection } from '../../components/SocialAuthButton';
import { useAuth } from '../../contexts/AuthContext';
import OAuthService from '../../services/OAuthService';
import ShopService from '../../services/ShopService';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, loginWithGoogle, loginWithApple } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { email, password, confirmPassword, firstName, lastName, phoneNumber } = formData;

    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const success = await register({
        email,
        password,
        password_confirm: confirmPassword,
        first_name: firstName,
        last_name: lastName,
      });

      if (!success) {
        Alert.alert('Error', 'No se pudo crear la cuenta. Inténtalo de nuevo.');
        return;
      }
      
      // Verificar si hay una redirección pendiente al carrito
      const hasPendingCartRedirect = ShopService.getPendingCartRedirect();
      
      if (hasPendingCartRedirect) {
        // Limpiar la bandera y redirigir al carrito
        ShopService.clearPendingCartRedirect();
        
        Alert.alert(
          '¡Cuenta creada!',
          'Registro exitoso. Te llevamos a completar tu compra.',
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
          '¡Cuenta creada!',
          'Registro exitoso. ¡Bienvenido a Hablaris!',
          [
            {
              text: 'Continuar',
              onPress: () => navigation.navigate('Main'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear la cuenta');
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
            'Registro exitoso con Google. Te llevamos a completar tu compra.',
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
            'Registro exitoso con Google',
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
        Alert.alert('Error', 'No se pudo registrar con Google');
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
            'Registro exitoso con Apple. Te llevamos a completar tu compra.',
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
            'Registro exitoso con Apple',
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
        Alert.alert('Error', 'No se pudo registrar con Apple');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado con Apple Sign In');
    } finally {
      setAppleLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
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
            
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Sign up to get started
            </Text>
          </View>

          {/* Social Auth Section - PRIMERO */}
          <SocialAuthSection
            onGooglePress={handleGoogleSignIn}
            onApplePress={handleAppleSignIn}
            googleLoading={googleLoading}
            appleLoading={appleLoading}
            showApple={showAppleSignIn}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O crea una cuenta con email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.form}>
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Nombre *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    autoCapitalize="words"
                    placeholder="Nombre"
                    placeholderTextColor={COLORS.gray[400]}
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Apellido *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    autoCapitalize="words"
                    placeholder="Apellido"
                    placeholderTextColor={COLORS.gray[400]}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teléfono (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  keyboardType="phone-pad"
                  placeholder="+1234567890"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>

              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginLink}>Inicia Sesión</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.md, // Reducido de xl a md
  },
  logoContainer: {
    marginBottom: SPACING.sm, // Reducido de lg a sm
  },
  logo: {
    width: 60, // Reducido de 80 a 60
    height: 60, // Reducido de 80 a 60
    borderRadius: 20, // Ajustado proporcionalmente
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 }, // Reducido
    shadowOpacity: 0.2, // Reducido
    shadowRadius: 8, // Reducido
    elevation: 6, // Reducido
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
    lineHeight: 20, // Reducido de 24 a 20
    paddingHorizontal: SPACING.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md, // Reducido de xl a md
    paddingHorizontal: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[300],
  },
  dividerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    marginHorizontal: SPACING.md,
    fontWeight: '500',
  },
  form: {
    marginBottom: SPACING.md, // Reducido de xl a md
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: SPACING.md, // Reducido de lg a md
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[900],
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  registerButton: {
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loginText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
  },
  loginLink: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
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

export default RegisterScreen;
