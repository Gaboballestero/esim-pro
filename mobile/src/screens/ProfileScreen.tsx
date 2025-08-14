import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { AuthService } from '../services/AuthService';
import { useAuth } from '../contexts/AuthContext';
import { User, MainTabParamList, RootStackParamList } from '../types';
import LanguageSelector from '../components/LanguageSelector';
import CurrencySelector from '../components/CurrencySelector';
import HablarisNotificationService from '../services/HablarisNotificationService';

interface UserStats {
  profile: {
    member_since: string;
    is_verified: boolean;
    total_esims: number;
    active_esims: number;
  };
  usage: {
    total_orders: number;
    total_spent: number;
    preferred_currency: string;
  };
}

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  StackNavigationProp<RootStackParamList>
>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  useEffect(() => {
    loadUserProfile();
    loadUserStats();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await AuthService.getProfile();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setEditedUser(response.data.user);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Simular estadísticas por ahora
      const mockStats: UserStats = {
        profile: {
          member_since: '2024-01-15',
          is_verified: true,
          total_esims: 3,
          active_esims: 2,
        },
        usage: {
          total_orders: 5,
          total_spent: 125.50,
          preferred_currency: 'USD',
        }
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    await loadUserStats();
    setRefreshing(false);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await AuthService.updateProfile(editedUser);
      if (response.success) {
        setUser(response.data?.user || user);
        setEditMode(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar el perfil');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              
              // Navegar de vuelta al Shop sin autenticación, reseteando el stack principal
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Shop' }],
              });

            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Hubo un problema al cerrar sesión. Inténtalo de nuevo.');
            }
          },
        },
      ]
    );
  };

  // Funciones para testear notificaciones
  const handleTestBasicNotification = async () => {
    try {
      await HablarisNotificationService.sendTestNotification();
      Alert.alert('✅ Éxito', 'Notificación de prueba enviada');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo enviar la notificación');
      console.error('Error sending test notification:', error);
    }
  };

  const handleTestDataAlert = async () => {
    try {
      await HablarisNotificationService.sendDataLowAlert(85, '150 MB', 'Europa Plus');
      Alert.alert('✅ Éxito', 'Alerta de datos enviada');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo enviar la alerta');
      console.error('Error sending data alert:', error);
    }
  };

  const handleTestExpiryAlert = async () => {
    try {
      await HablarisNotificationService.sendExpiryAlert('Asia Premium', 2);
      Alert.alert('✅ Éxito', 'Alerta de vencimiento enviada');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo enviar la alerta');
      console.error('Error sending expiry alert:', error);
    }
  };

  const handleTestPromoOffer = async () => {
    try {
      await HablarisNotificationService.sendPromoOffer(
        'Oferta Especial',
        'Planes internacionales con',
        '30'
      );
      Alert.alert('✅ Éxito', 'Oferta promocional enviada');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo enviar la oferta');
      console.error('Error sending promo offer:', error);
    }
  };

  const showNotificationTestMenu = () => {
    Alert.alert(
      '🔔 Test de Notificaciones',
      'Selecciona el tipo de notificación que quieres probar:',
      [
        {
          text: '🧪 Básica',
          onPress: handleTestBasicNotification,
        },
        {
          text: '⚠️ Alerta de Datos',
          onPress: handleTestDataAlert,
        },
        {
          text: '📅 Vencimiento',
          onPress: handleTestExpiryAlert,
        },
        {
          text: '🎁 Oferta',
          onPress: handleTestPromoOffer,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.headerGradient}
    >
      <View style={styles.profileImageContainer}>
        <View style={styles.profileImage}>
          <Ionicons name="person" size={40} color={COLORS.white} />
        </View>
        {stats?.profile.is_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          </View>
        )}
      </View>
      
      <Text style={styles.profileName}>
        {user?.first_name && user?.last_name 
          ? `${user.first_name} ${user.last_name}`
          : user?.email.split('@')[0] || 'Usuario'
        }
      </Text>
      
      <Text style={styles.profileEmail}>{user?.email}</Text>
      
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setEditMode(!editMode)}
      >
        <Ionicons 
          name={editMode ? "close" : "create-outline"} 
          size={20} 
          color={COLORS.white} 
        />
        <Text style={styles.editButtonText}>
          {editMode ? 'Cancelar' : 'Editar'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Resumen de Cuenta</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="card-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{stats?.profile.total_esims || 0}</Text>
          <Text style={styles.statLabel}>eSIMs Totales</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="radio-outline" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>{stats?.profile.active_esims || 0}</Text>
          <Text style={styles.statLabel}>eSIMs Activas</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="receipt-outline" size={24} color={COLORS.info} />
          <Text style={styles.statNumber}>{stats?.usage.total_orders || 0}</Text>
          <Text style={styles.statLabel}>Pedidos</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="wallet-outline" size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>
            ${(stats?.usage.total_spent || 0).toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Gastado</Text>
        </View>
      </View>
    </View>
  );

  const renderEditForm = () => (
    <View style={styles.editForm}>
      <Text style={styles.formTitle}>Editar Información Personal</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre</Text>
        <TextInput
          style={styles.textInput}
          value={editedUser.first_name || ''}
          onChangeText={(text) => setEditedUser({...editedUser, first_name: text})}
          placeholder="Tu nombre"
          placeholderTextColor={COLORS.gray[400]}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Apellido</Text>
        <TextInput
          style={styles.textInput}
          value={editedUser.last_name || ''}
          onChangeText={(text) => setEditedUser({...editedUser, last_name: text})}
          placeholder="Tu apellido"
          placeholderTextColor={COLORS.gray[400]}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Teléfono</Text>
        <TextInput
          style={styles.textInput}
          value={editedUser.phone_number || ''}
          onChangeText={(text) => setEditedUser({...editedUser, phone_number: text})}
          placeholder="+1234567890"
          placeholderTextColor={COLORS.gray[400]}
          keyboardType="phone-pad"
        />
      </View>
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.saveButtonGradient}
        >
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderMenuItems = () => (
    <View style={styles.menuSection}>
      <Text style={styles.menuTitle}>Configuración</Text>
      
      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <Ionicons name="lock-closed-outline" size={24} color={COLORS.gray[600]} />
          <Text style={styles.menuItemText}>Cambiar Contraseña</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => setShowLanguageSelector(true)}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="language-outline" size={24} color={COLORS.gray[600]} />
          <Text style={styles.menuItemText}>Idioma</Text>
        </View>
        <View style={styles.menuItemRight}>
          <Text style={styles.menuItemValue}>
            {getLanguageDisplay(selectedLanguage)}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => setShowCurrencySelector(true)}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="card-outline" size={24} color={COLORS.gray[600]} />
          <Text style={styles.menuItemText}>Moneda</Text>
        </View>
        <View style={styles.menuItemRight}>
          <Text style={styles.menuItemValue}>
            {getCurrencyDisplay(selectedCurrency)}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.gray[600]} />
          <Text style={styles.menuItemText}>Notificaciones</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.gray[600]} />
          <Text style={styles.menuItemText}>Privacidad</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('Support')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.gray[600]} />
          <Text style={styles.menuItemText}>Ayuda y Soporte</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
    </View>
  );

  const renderCompetitiveFeatures = () => (
    <View style={styles.menuSection}>
      <Text style={styles.menuTitle}>Funciones Avanzadas</Text>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('Rewards')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="gift-outline" size={24} color={COLORS.primary} />
          <Text style={styles.menuItemText}>Recompensas y Puntos</Text>
        </View>
        <View style={styles.menuItemRight}>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NUEVO</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('Geolocation')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="location-outline" size={24} color={COLORS.success} />
          <Text style={styles.menuItemText}>Ubicación Inteligente</Text>
        </View>
        <View style={styles.menuItemRight}>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NUEVO</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('FlexiblePlans')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="options-outline" size={24} color={COLORS.warning} />
          <Text style={styles.menuItemText}>Planes Personalizados</Text>
        </View>
        <View style={styles.menuItemRight}>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NUEVO</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('AdvancedDashboard')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="analytics-outline" size={24} color={COLORS.info} />
          <Text style={styles.menuItemText}>Analytics Avanzado</Text>
        </View>
        <View style={styles.menuItemRight}>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NUEVO</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('CoverageMap')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="map-outline" size={24} color={COLORS.primary} />
          <Text style={styles.menuItemText}>Mapa de Cobertura</Text>
        </View>
        <View style={styles.menuItemRight}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('DataUsage')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="bar-chart-outline" size={24} color={COLORS.success} />
          <Text style={styles.menuItemText}>Uso de Datos</Text>
        </View>
        <View style={styles.menuItemRight}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('PlanManagement')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="settings-outline" size={24} color={COLORS.warning} />
          <Text style={styles.menuItemText}>Gestión de Planes</Text>
        </View>
        <View style={styles.menuItemRight}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('AIAssistant')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="bulb-outline" size={24} color={COLORS.info} />
          <Text style={styles.menuItemText}>Asistente IA</Text>
        </View>
        <View style={styles.menuItemRight}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>IA</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('NotificationSettings')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.warning} />
          <Text style={styles.menuItemText}>Notificaciones</Text>
        </View>
        <View style={styles.menuItemRight}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem}
        onPress={showNotificationTestMenu}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="flask-outline" size={24} color="#FF6B35" />
          <Text style={styles.menuItemText}>Test Notificaciones</Text>
        </View>
        <View style={styles.menuItemRight}>
          <View style={[styles.newBadge, { backgroundColor: '#FF6B35' }]}>
            <Text style={styles.newBadgeText}>TEST</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('AccountSettings')}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons name="settings-outline" size={24} color={COLORS.gray[600]} />
          <Text style={styles.menuItemText}>Configuración de Cuenta</Text>
        </View>
        <View style={styles.menuItemRight}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const getLanguageDisplay = (code: string) => {
    const languages = {
      'es': 'Español',
      'en': 'English',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português',
      'zh': '中文',
      'ja': '日本語',
      'ko': '한국어',
      'ar': 'العربية',
      'ru': 'Русский',
      'hi': 'हिन्दी',
    };
    return languages[code as keyof typeof languages] || 'Español';
  };

  const getCurrencyDisplay = (code: string) => {
    const currencies = {
      'USD': 'USD ($)',
      'EUR': 'EUR (€)',
      'GBP': 'GBP (£)',
      'JPY': 'JPY (¥)',
      'CNY': 'CNY (¥)',
      'CAD': 'CAD (C$)',
      'AUD': 'AUD (A$)',
      'CHF': 'CHF',
      'SEK': 'SEK (kr)',
      'NOK': 'NOK (kr)',
      'DKK': 'DKK (kr)',
      'PLN': 'PLN (zł)',
      'CZK': 'CZK (Kč)',
      'HUF': 'HUF (Ft)',
      'RON': 'RON (lei)',
      'BGN': 'BGN (лв)',
      'HRK': 'HRK (kn)',
      'RUB': 'RUB (₽)',
      'TRY': 'TRY (₺)',
      'BRL': 'BRL (R$)',
      'MXN': 'MXN ($)',
      'ARS': 'ARS ($)',
      'CLP': 'CLP ($)',
      'COP': 'COP ($)',
      'PEN': 'PEN (S/)',
    };
    return currencies[code as keyof typeof currencies] || 'USD ($)';
  };

  const handleLanguageSelect = (language: any) => {
    setSelectedLanguage(language.code);
    // Aquí podrías actualizar el perfil del usuario
  };

  const handleCurrencySelect = (currency: any) => {
    setSelectedCurrency(currency.code);
    // Aquí podrías actualizar el perfil del usuario
  };

  const renderLogoutButton = () => (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
      <Text style={styles.logoutText}>Cerrar Sesión</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderProfileHeader()}
          {renderStatsCard()}
          {editMode ? renderEditForm() : (
            <>
              {renderCompetitiveFeatures()}
              {renderMenuItems()}
            </>
          )}
          {renderLogoutButton()}
        </ScrollView>
      </Animated.View>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        onSelect={handleLanguageSelect}
        selectedLanguage={selectedLanguage}
      />

      {/* Currency Selector Modal */}
      <CurrencySelector
        visible={showCurrencySelector}
        onClose={() => setShowCurrencySelector(false)}
        onSelect={handleCurrencySelect}
        selectedCurrency={selectedCurrency}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
  },
  
  // Header styles
  headerGradient: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  profileName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editButtonText: {
    color: COLORS.white,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  
  // Stats card styles
  statsCard: {
    margin: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  
  // Edit form styles
  editForm: {
    margin: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  saveButton: {
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  
  // Menu styles
  menuSection: {
    margin: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.black,
    marginLeft: SPACING.md,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    marginRight: SPACING.sm,
  },
  
  // New badge styles
  newBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  
  // Premium badge styles
  premiumBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  
  // AI badge styles
  aiBadge: {
    backgroundColor: COLORS.info,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  
  // Logout button styles
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default ProfileScreen;
