import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import HablarisLogoOnly from '../components/HablarisLogoOnly';
import ShopService, { ShopCategory, FeaturedOffer, PopularDestination, ShopPlan } from '../services/ShopService';
import { useAuth } from '../contexts/AuthContext';
import * as Notifications from 'expo-notifications';
import HablarisNotificationService from '../services/HablarisNotificationService';

type ShopScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ShopScreen: React.FC = () => {
  const navigation = useNavigation<ShopScreenNavigationProp>();
  const route = useRoute();
  const { user, isAuthenticated } = useAuth();
  
  // Detectar si estamos en el contexto de las tabs principales
  // Verificamos si hay un parent tab navigator y si el usuario está autenticado
  const parentNavigator = navigation.getParent();
  const hasTabParent = parentNavigator?.getState()?.type === 'tab';
  const isInTabContext = isAuthenticated && hasTabParent;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [featuredOffers, setFeaturedOffers] = useState<FeaturedOffer[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [plans, setPlans] = useState<ShopPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo Notifications Functions
  const showDemoNotifications = () => {
    Alert.alert(
      '🔔 Centro de Demo - Hablaris',
      'Prueba todas las funcionalidades de notificaciones:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📊 Datos Bajos (500MB)', onPress: () => showDataLowAlert() },
        { text: '⏰ Plan Expira (2 días)', onPress: () => showPlanExpiryAlert() },
        { text: '🌍 Roaming (México)', onPress: () => showRoamingAlert() },
        { text: '💡 IA: Plan Mejor', onPress: () => showAIRecommendationAlert() },
        { text: '🎉 Oferta 40% OFF', onPress: () => showSpecialOfferAlert() },
        { text: '� Push Notification', onPress: () => sendPushNotificationDemo() },
        { text: '🚀 Demo Completo (6 alertas)', onPress: () => showAllDemoAlerts() },
      ]
    );
  };

  const showDataLowAlert = () => {
    Alert.alert(
      '📊 ¡Atención! Datos Bajos',
      '🇺🇸 Plan Estados Unidos\n\n📱 Datos restantes: 487 MB de 5GB\n📅 Renovación: 18 de Agosto\n\n💡 Sugerencia: Compra 2GB adicionales por solo $8.99',
      [
        { text: '⏰ Recordar en 2 horas', style: 'cancel' },
        { text: '🛒 Comprar datos', onPress: () => navigation.navigate('DataUsage') },
      ]
    );
  };

  const showPlanExpiryAlert = () => {
    Alert.alert(
      '⏰ Tu Plan Expira Pronto',
      '🇪🇺 Plan Europa Premium\n\n📅 Expira: 15 de Agosto (2 días)\n💰 Precio de renovación: $24.99\n\n🔄 ¿Activar renovación automática?',
      [
        { text: '❌ No renovar', style: 'destructive' },
        { text: '⚙️ Configurar', onPress: () => navigation.navigate('PlanManagement') },
        { text: '✅ Renovar ahora', style: 'default' },
      ]
    );
  };

  const showRoamingAlert = () => {
    Alert.alert(
      '🌍 ¡Roaming Detectado!',
      '📍 Ubicación: Ciudad de México, México 🇲🇽\n\n⚠️ Estás usando roaming internacional\n💸 Costo actual: $2.50/MB\n\n💡 Plan México: $12.99 (3GB, 15 días)',
      [
        { text: '🚫 Continuar roaming', style: 'cancel' },
        { text: '🇲🇽 Ver planes México', onPress: () => navigation.navigate('Shop') },
      ]
    );
  };

  const showAIRecommendationAlert = () => {
    Alert.alert(
      '🤖 Recomendación IA Personal',
      '📊 Análisis de tu uso:\n• Promedio: 8.2GB/mes\n• Destino frecuente: Europa\n• Ahorro potencial: 35%\n\n💎 Plan Europa Plus:\n• 10GB → 15GB (+50%)\n• 25 países → 40 países\n• $24.99 → $24.99 (mismo precio)',
      [
        { text: '🤔 Ver después', style: 'cancel' },
        { text: '🤖 Más recomendaciones', onPress: () => navigation.navigate('AIAssistant') },
        { text: '⬆️ Cambiar plan', style: 'default' },
      ]
    );
  };

  const showSpecialOfferAlert = () => {
    Alert.alert(
      '🎉 ¡OFERTA FLASH!',
      '⚡ Solo por las próximas 4 horas\n\n🌏 40% OFF en planes de Asia\n🎌 Japón: $19.99 → $11.99\n🇰🇷 Corea: $17.99 → $10.79\n🇹🇭 Tailandia: $14.99 → $8.99\n\n⏰ Termina a las 8:00 PM',
      [
        { text: '⏰ Recordar en 1 hora', style: 'cancel' },
        { text: '🔥 Ver todas las ofertas', onPress: () => navigation.navigate('Shop') },
      ]
    );
  };

  const showIndividualAlertsMenu = () => {
    Alert.alert(
      '🔔 Alertas Individuales',
      'Elige qué tipo de alerta quieres probar:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📊 Datos Bajos', onPress: () => showDataLowAlert() },
        { text: '⏰ Plan Expirando', onPress: () => showPlanExpiryAlert() },
        { text: '🌍 Roaming Detectado', onPress: () => showRoamingAlert() },
        { text: '🤖 Recomendación IA', onPress: () => showAIRecommendationAlert() },
        { text: '🎉 Oferta Especial', onPress: () => showSpecialOfferAlert() },
      ]
    );
  };

  const showAllDemoAlerts = async () => {
    Alert.alert(
      '🚀 Demo Completo Iniciado',
      'Se mostrarán 5 alertas con intervalos de 2 segundos. ¡Prepárate para la experiencia completa!',
      [{ text: '🎬 ¡Empezar!', onPress: () => startDemoSequence() }]
    );
  };

  const startDemoSequence = () => {
    // Secuencia de alertas con delays progresivos
    setTimeout(() => {
      Alert.alert('🎬 Demo 1/5', 'Datos bajos...', 
        [{ text: 'Siguiente', onPress: () => showDataLowAlert() }]);
    }, 1000);
    
    setTimeout(() => {
      Alert.alert('🎬 Demo 2/5', 'Plan expirando...', 
        [{ text: 'Siguiente', onPress: () => showPlanExpiryAlert() }]);
    }, 3000);
    
    setTimeout(() => {
      Alert.alert('🎬 Demo 3/5', 'Roaming detectado...', 
        [{ text: 'Siguiente', onPress: () => showRoamingAlert() }]);
    }, 5000);
    
    setTimeout(() => {
      Alert.alert('🎬 Demo 4/5', 'Recomendación IA...', 
        [{ text: 'Siguiente', onPress: () => showAIRecommendationAlert() }]);
    }, 7000);
    
    setTimeout(() => {
      Alert.alert('🎬 Demo 5/5', 'Oferta especial...', 
        [{ text: 'Final', onPress: () => showSpecialOfferAlert() }]);
    }, 9000);
  };

  // Push Notification Demo con múltiples variaciones
  const sendPushNotificationDemo = async () => {
    const notificationOptions = [
      {
        title: "📱 Hablaris - Datos Bajos",
        body: "⚠️ Solo te quedan 487MB en tu plan de Estados Unidos",
        data: { type: 'data_low', planId: 'usa_123' },
      },
      {
        title: "🔔 Hablaris - Plan Expira",
        body: "⏰ Tu plan de Europa expira en 2 días. ¿Renovar?",
        data: { type: 'plan_expiry', planId: 'eu_456' },
      },
      {
        title: "🌍 Hablaris - Roaming",
        body: "📍 Detectamos que estás en México. ¿Plan local?",
        data: { type: 'roaming', country: 'mexico' },
      },
      {
        title: "🤖 Hablaris - Recomendación",
        body: "💡 Tenemos una recomendación personalizada para ti",
        data: { type: 'ai_recommendation', savings: '35%' },
      },
      {
        title: "🎉 Hablaris - Oferta Flash",
        body: "⚡ 40% OFF en planes de Asia. ¡Solo 4 horas!",
        data: { type: 'flash_offer', discount: '40%' },
      }
    ];

    Alert.alert(
      '📱 Demo Push Notifications',
      'Elige cuál notificación push quieres probar:',
      [
        { text: 'Cancelar', style: 'cancel' },
        ...notificationOptions.map((notif, index) => ({
          text: `${index + 1}. ${notif.title.split(' - ')[1]}`,
          onPress: () => sendSinglePushNotification(notif)
        })),
        { text: '🚀 Enviar todas (cada 3s)', onPress: () => sendAllPushNotifications(notificationOptions) }
      ]
    );
  };

  const sendSinglePushNotification = async (notification: any) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: notification,
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2 
        },
      });

      Alert.alert(
        '🚀 Push Enviada',
        `"${notification.title}" será entregada en 2 segundos.`
      );
    } catch (error) {
      Alert.alert(
        '❌ Error Push',
        'Verifica que los permisos de notificación estén habilitados.'
      );
    }
  };

  const sendAllPushNotifications = async (notifications: any[]) => {
    try {
      for (let i = 0; i < notifications.length; i++) {
        await Notifications.scheduleNotificationAsync({
          content: notifications[i],
          trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 2 + (i * 3) // Cada 3 segundos
          },
        });
      }

      Alert.alert(
        '🎊 ¡Todas Enviadas!',
        `Se programaron ${notifications.length} notificaciones push. Recibirás una cada 3 segundos.`
      );
    } catch (error) {
      Alert.alert(
        '❌ Error',
        'No se pudieron programar las notificaciones.'
      );
    }
  };

  useEffect(() => {
    loadInitialData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    loadPlansByCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      searchPlans();
    } else {
      loadPlansByCategory(selectedCategory);
    }
  }, [searchQuery]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData, offersData, destinationsData] = await Promise.all([
        ShopService.getCategories(),
        ShopService.getFeaturedOffers(),
        ShopService.getPopularDestinations(),
      ]);

      setCategories(categoriesData);
      setFeaturedOffers(offersData);
      setPopularDestinations(destinationsData);
      
      // Load initial plans
      await loadPlansByCategory(selectedCategory);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlansByCategory = async (categoryId: string) => {
    try {
      const plansData = await ShopService.getPlansByCategory(categoryId);
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const searchPlans = async () => {
    try {
      const searchResults = await ShopService.searchPlans(searchQuery);
      setPlans(searchResults);
    } catch (error) {
      console.error('Error searching plans:', error);
    }
  };

  const handleAddToCart = (plan: ShopPlan) => {
    ShopService.addToCart(plan);
    
    Alert.alert(
      'Agregado al carrito',
      `${plan.name} se agregó correctamente al carrito.`,
      [
        { text: 'Continuar', style: 'default' },
        { text: 'Ver carrito', style: 'default', onPress: () => navigateToCart() },
      ]
    );
  };

  const handleDestinationPress = (destination: PopularDestination) => {
    // Filtrar planes localmente y navegar con el query en searchQuery
    setSearchQuery(destination.name);
    setSelectedCategory('all');
    
    // Mostrar información del destino seleccionado
    Alert.alert(
      `🗺️ ${destination.flag} ${destination.name}`,
      `Región: ${destination.region}\nPlanes disponibles: ${destination.planCount}\nDesde: $${destination.fromPrice}`,
      [
        { text: 'Ver Planes', onPress: () => navigation.navigate('Plans') },
        { text: 'Buscar aquí', style: 'default' }
      ]
    );
  };

  const handleViewAllDestinations = () => {
    // Navegar a la pantalla de planes donde se pueden ver todos los destinos disponibles
    navigation.navigate('Plans');
  };

  const navigateToCart = () => {
    if (!isAuthenticated) {
      // Si no está autenticado, ir a login y luego al carrito
      Alert.alert(
        'Iniciar sesión requerido',
        'Para proceder con la compra, necesitas iniciar sesión.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Iniciar sesión', 
            onPress: () => {
              // Guardar que debe ir al carrito después del login
              ShopService.setPendingCartRedirect(true);
              navigation.navigate('Login');
            }
          },
        ]
      );
    } else {
      // Navegar al carrito/checkout
      navigation.navigate('Checkout', { plan: null });
    }
  };

  const handleBuyNow = async (planId: number) => {
    // Encontrar el plan y agregarlo al carrito
    const plan = plans.find(p => p.id === planId) || 
                 featuredOffers.find(o => o.planId === planId);
    
    if (!plan) {
      Alert.alert('Error', 'Plan no encontrado');
      return;
    }

    // Si es un featured offer, crear un plan temporal
    const planToAdd = plan.hasOwnProperty('planId') 
      ? {
          id: (plan as FeaturedOffer).planId,
          name: (plan as FeaturedOffer).title,
          price: parseFloat((plan as FeaturedOffer).price.replace('$', '')),
          data: '5GB', // Valor por defecto, debería venir del offer
          days: 30,    // Valor por defecto, debería venir del offer
          flag: '🌍',  // Valor por defecto
        } as ShopPlan
      : plan as ShopPlan;

    // Agregar al carrito
    ShopService.addToCart(planToAdd);

    if (!isAuthenticated) {
      Alert.alert(
        'Iniciar sesión requerido',
        'Para proceder con la compra, necesitas iniciar sesión. Tu producto se ha guardado en el carrito.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Iniciar sesión', 
            onPress: () => {
              // Guardar que debe ir al carrito después del login
              ShopService.setPendingCartRedirect(true);
              navigation.navigate('Login');
            }
          },
        ]
      );
    } else {
      // Usuario autenticado, ir directamente al checkout
      navigation.navigate('Checkout', { plan: planToAdd });
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Notificaciones en esquina superior derecha */}
      {isAuthenticated && (
        <TouchableOpacity 
          style={styles.notificationCorner}
          onPress={() => {
            Alert.alert(
              '🔔 Notificaciones',
              'Centro de notificaciones de Hablaris',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: '📊 Datos Bajos', onPress: () => showDataLowAlert() },
                { text: '⏰ Plan Expirando', onPress: () => showPlanExpiryAlert() },
                { text: '🎉 Ofertas Especiales', onPress: () => showSpecialOfferAlert() },
              ]
            );
          }}
        >
          <Ionicons name="notifications" size={24} color={COLORS.primary} />
          <View style={styles.notificationBadgeCorner}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Botones de autenticación solo para usuarios no logueados y fuera de tabs */}
      {!isAuthenticated && !isInTabContext && (
        <View style={styles.authActionsBelow}>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="person-outline" size={16} color={COLORS.primary} />
            <Text style={styles.authButtonText}>Cuenta</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sección integrada con logo y conecta sin límites */}
      <View style={styles.heroSectionInitial}>
        <View style={styles.heroContentIntegrated}>
          {/* Logo en extremo izquierdo */}
          <View style={styles.logoLeft}>
            <HablarisLogoOnly size={24} speed={2.0} />
          </View>
          
          {/* Contenido central */}
          <View style={styles.centralContent}>
            <Text style={styles.worldIcon}>🌍</Text>
            <Text style={styles.heroTitleInitial}>Conecta sin límites</Text>
            <Text style={styles.heroSubtitleInitial}>
              eSIMs instantáneas para más de 200 países
            </Text>
          </View>
          
          {/* Espacio para balancear el diseño */}
          <View style={styles.rightSpacer} />
        </View>
      </View>
    </View>
  );  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={COLORS.gray[500]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar destino o plan..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray[500]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray[500]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category, index) => (
          <Animated.View
            key={category.id}
            style={[
              {
                opacity: fadeAnim,
                transform: [{
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                }],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={[
                styles.categoryIcon,
                selectedCategory === category.id && styles.categoryIconActive
              ]}>
                <Ionicons 
                  name={category.icon as any} 
                  size={20} 
                  color={selectedCategory === category.id ? COLORS.white : COLORS.primary} 
                />
              </View>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );

  const renderSalesBooster = () => (
    <View style={styles.salesBoosterSection}>
      <Text style={styles.salesBoosterTitle}>💼 ¿Por qué elegir Hablaris?</Text>
      
      <View style={styles.salesBoosterGrid}>
        {/* Beneficio 1: Ahorro */}
        <View style={styles.salesBoosterCard}>
          <LinearGradient
            colors={[`${COLORS.success}15`, `${COLORS.success}25`]}
            style={styles.salesBoosterCardGradient}
          >
            <View style={[styles.salesBoosterIcon, { backgroundColor: `${COLORS.success}20` }]}>
              <Ionicons name="wallet" size={28} color={COLORS.success} />
            </View>
            <Text style={styles.salesBoosterCardTitle}>Ahorra hasta 90%</Text>
            <Text style={styles.salesBoosterCardSubtitle}>vs. roaming tradicional</Text>
          </LinearGradient>
        </View>

        {/* Beneficio 2: Cobertura */}
        <View style={styles.salesBoosterCard}>
          <LinearGradient
            colors={[`${COLORS.primary}15`, `${COLORS.primary}25`]}
            style={styles.salesBoosterCardGradient}
          >
            <View style={[styles.salesBoosterIcon, { backgroundColor: `${COLORS.primary}20` }]}>
              <Ionicons name="earth" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.salesBoosterCardTitle}>190+ países</Text>
            <Text style={styles.salesBoosterCardSubtitle}>Cobertura mundial</Text>
          </LinearGradient>
        </View>

        {/* Beneficio 3: Velocidad */}
        <View style={styles.salesBoosterCard}>
          <LinearGradient
            colors={[`${COLORS.warning}15`, `${COLORS.warning}25`]}
            style={styles.salesBoosterCardGradient}
          >
            <View style={[styles.salesBoosterIcon, { backgroundColor: `${COLORS.warning}20` }]}>
              <Ionicons name="flash" size={28} color={COLORS.warning} />
            </View>
            <Text style={styles.salesBoosterCardTitle}>Activación</Text>
            <Text style={styles.salesBoosterCardSubtitle}>en segundos</Text>
          </LinearGradient>
        </View>

        {/* Beneficio 4: Soporte */}
        <View style={styles.salesBoosterCard}>
          <LinearGradient
            colors={[`${COLORS.info}15`, `${COLORS.info}25`]}
            style={styles.salesBoosterCardGradient}
          >
            <View style={[styles.salesBoosterIcon, { backgroundColor: `${COLORS.info}20` }]}>
              <Ionicons name="headset" size={28} color={COLORS.info} />
            </View>
            <Text style={styles.salesBoosterCardTitle}>Soporte 24/7</Text>
            <Text style={styles.salesBoosterCardSubtitle}>Asistencia experta</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Call to action urgente */}
      <TouchableOpacity style={styles.urgentCTAButton}>
        <LinearGradient
          colors={[COLORS.error, '#FF6B35']}
          style={styles.urgentCTAGradient}
        >
          <View style={styles.urgentCTAContent}>
            <Text style={styles.urgentCTAText}>🔥 ¡Oferta limitada!</Text>
            <Text style={styles.urgentCTASubtext}>20% OFF en tu primer plan</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.quickActionsTitle}>Acceso Rápido</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('CoverageMap')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${COLORS.primary}20` }]}>
            <Ionicons name="map" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionText}>Mapa de Cobertura</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('DataUsage')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${COLORS.success}20` }]}>
            <Ionicons name="analytics" size={24} color={COLORS.success} />
          </View>
          <Text style={styles.quickActionText}>Uso de Datos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('PlanManagement')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${COLORS.warning}20` }]}>
            <Ionicons name="settings" size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.quickActionText}>Gestión</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('AIAssistant')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${COLORS.info}20` }]}>
            <Ionicons name="bulb" size={24} color={COLORS.info} />
          </View>
          <Text style={styles.quickActionText}>Asistente IA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeaturedOffers = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.offersTitleContainer}>
          <Text style={styles.offersMainTitle}>🔥 OFERTAS ESPECIALES</Text>
          <Text style={styles.offersSubtitle}>Por tiempo limitado</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>Ver todas</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.offersContainer}
      >
        {featuredOffers.map((offer, index) => (
          <Animated.View
            key={offer.id}
            style={[
              styles.offerCard,
              {
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                }],
              },
            ]}
          >
            <TouchableOpacity 
              activeOpacity={0.95}
              style={styles.offerTouchable}
            >
              {/* Gradiente de fondo para profundidad */}
              <LinearGradient
                colors={[
                  `${COLORS.primary}05`,
                  `${COLORS.primary}15`,
                  `${COLORS.primary}25`
                ]}
                style={styles.offerCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              
              {offer.popular && (
                <View style={styles.popularBadge}>
                  <LinearGradient
                    colors={[COLORS.error, '#FF6B35']}
                    style={styles.popularBadgeGradient}
                  >
                    <Text style={styles.popularBadgeText}>🔥 POPULAR</Text>
                  </LinearGradient>
                </View>
              )}
              
              <View style={styles.offerImageContainer}>
                {/* Gradiente de fondo para el contenedor de imagen */}
                <LinearGradient
                  colors={[
                    `${COLORS.primary}08`,
                    `${COLORS.primary}18`,
                    `${COLORS.primary}12`
                  ]}
                  style={styles.offerImageGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                
                <Text style={styles.offerEmoji}>{offer.image}</Text>
                <View style={styles.discountBadge}>
                  <LinearGradient
                    colors={[COLORS.success, '#10B981']}
                    style={styles.discountBadgeGradient}
                  >
                    <Text style={styles.discountText}>-{offer.discount}</Text>
                  </LinearGradient>
                </View>
              </View>
              
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                
                <View style={styles.featuresContainer}>
                  {offer.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>{offer.originalPrice}</Text>
                  <Text style={styles.currentPrice}>{offer.price}</Text>
                </View>
                
                <View style={styles.offerActions}>
                  <TouchableOpacity 
                    style={styles.buyButton}
                    onPress={() => handleBuyNow(offer.planId)}
                  >
                    <Text style={styles.buyButtonText}>Comprar Ahora</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.addToCartButtonSmall}
                    onPress={() => {
                      // Crear un plan temporal para featured offers si no se encuentra en plans
                      let plan = plans.find(p => p.id === offer.planId);
                      
                      if (!plan) {
                        // Crear plan temporal desde el featured offer
                        plan = {
                          id: offer.planId,
                          name: offer.title,
                          price: parseFloat(offer.price.replace('$', '')),
                          data: '5GB', // Valor por defecto
                          days: 30,    // Valor por defecto
                          flag: '🌍',  // Valor por defecto
                          country: 'Global',
                          features: offer.features,
                          category: 'featured',
                        } as ShopPlan;
                      }
                      
                      handleAddToCart(plan);
                    }}
                  >
                    <Ionicons name="cart-outline" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );

  const renderPopularDestinations = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderNew}>
        <Text style={styles.sectionTitle}>Destinos Populares</Text>
        <TouchableOpacity onPress={() => handleViewAllDestinations()}>
          <Text style={styles.viewAllText}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.destinationsContainer}>
        {popularDestinations.slice(0, 8).map((destination, index) => (
          <Animated.View
            key={destination.id}
            style={[
              styles.destinationCardNew,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
              },
            ]}
          >
            <TouchableOpacity 
              style={styles.destinationTouchable}
              activeOpacity={0.8}
              onPress={() => handleDestinationPress(destination)}
            >
              {destination.trending && (
                <View style={styles.trendingBadge}>
                  <Ionicons name="trending-up" size={12} color="#FF6B6B" />
                  <Text style={styles.trendingText}>Trending</Text>
                </View>
              )}
              
              <View style={styles.destinationFlagContainer}>
                <Text style={styles.destinationFlagNew}>{destination.flag}</Text>
              </View>
              
              <Text style={styles.destinationNameNew} numberOfLines={1}>
                {destination.name}
              </Text>
              
              <View style={styles.destinationInfo}>
                <Text style={styles.destinationPlansNew}>
                  {destination.planCount} planes
                </Text>
                <Text style={styles.destinationRegion}>
                  {destination.region}
                </Text>
              </View>
              
              <View style={styles.destinationPriceContainer}>
                <Text style={styles.destinationPriceLabel}>Desde</Text>
                <Text style={styles.destinationPriceNew}>
                  ${destination.fromPrice}
                </Text>
              </View>
              
              <View style={styles.destinationRanking}>
                <Ionicons 
                  name="star" 
                  size={12} 
                  color="#FFD700" 
                />
                <Text style={styles.rankingText}>
                  #{destination.popularityRank}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderPlansList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando planes...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {categories.find(c => c.id === selectedCategory)?.name || 'Planes'}
        </Text>
        
        {plans.map((plan: ShopPlan, index: number) => (
          <Animated.View
            key={plan.id}
            style={[
              styles.planCard,
              {
                opacity: fadeAnim,
                transform: [{
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                }],
              },
            ]}
          >
            <TouchableOpacity style={styles.planCardContent}>
              <View style={styles.planInfo}>
                <Text style={styles.planFlag}>{plan.flag || '🌍'}</Text>
                <View style={styles.planDetails}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planSpecs}>{plan.data} • {plan.days} días</Text>
                </View>
              </View>
              
              <View style={styles.planPricing}>
                <Text style={styles.planPrice}>${plan.price}</Text>
                <TouchableOpacity 
                  style={styles.addToCartButton}
                  onPress={() => handleAddToCart(plan)}
                >
                  <Ionicons name="add" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderSearchBar()}
        {renderCategories()}
        {renderFeaturedOffers()}
        {renderPopularDestinations()}
        {renderSalesBooster()}
        {renderPlansList()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  
  // Header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: SPACING.sm,
  },
  userNameInHeader: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.sm,
    backgroundColor: `${COLORS.white}20`,
    borderRadius: BORDER_RADIUS.lg,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopTitleInNav: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  simpleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  logoSubtle: {
    opacity: 0.7,
  },
  notificationButtonSimple: {
    position: 'relative',
    padding: SPACING.xs,
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.md,
  },
  notificationBadgeSimple: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  heroSectionInitial: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
    backgroundColor: 'transparent',
  },
  heroContentInitial: {
    alignItems: 'center',
  },
  heroContentIntegrated: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoLeft: {
    opacity: 0.7,
  },
  centralContent: {
    alignItems: 'center',
    flex: 1,
  },
  notificationRight: {
    position: 'relative',
    padding: SPACING.xs,
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.md,
  },
  notificationCorner: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.lg,
    zIndex: 1000,
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationBadgeCorner: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  rightSpacer: {
    width: 24,
  },
  worldIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  heroTitleInitial: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.gray[700],
    textAlign: 'center',
    marginBottom: 2,
  },
  heroSubtitleInitial: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.8,
  },
  authActionsBelow: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 0,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  
  // Header Actions Styles
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  authButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  authenticatedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    maxWidth: 120,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userName: {
    color: COLORS.gray[700],
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    flex: 1,
  },
  
  // Search
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.black,
  },
  
  // Categories
  categoriesSection: {
    marginBottom: SPACING.xl,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryCard: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 90,
  },
  categoryCardActive: {
    backgroundColor: COLORS.primary,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryIconActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.black,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  
  // Sections
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Featured Offers
  offersContainer: {
    paddingRight: SPACING.lg,
    gap: SPACING.lg,
  },
  offerCard: {
    width: 280,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    // Efectos 3D avanzados
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 20,
    // Gradiente y borde para profundidad
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    // Transform 3D mejorado
    transform: [
      { perspective: 1000 },
      { rotateX: '2deg' },
      { scale: 1.02 },
    ],
    // Efecto de elevación
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  popularBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    zIndex: 10,
    // Sombra mejorada para efecto 3D
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  popularBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  // Nuevos estilos 3D para gradientes
  offerCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  popularBadgeGradient: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  offerImageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  discountBadgeGradient: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  offerTouchable: {
    // Transform para efecto de presión 3D
    transform: [{ scale: 1 }],
  },
  offerImageContainer: {
    height: 120,
    // Gradiente más complejo para profundidad
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra interna para efecto 3D
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  offerEmoji: {
    fontSize: 52,
    // Efecto 3D mejorado para el emoji
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 3, height: 5 },
    textShadowRadius: 8,
    transform: [{ scale: 1.15 }],
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    // Sombra para efecto 3D
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  offerContent: {
    padding: SPACING.lg,
    // Gradiente sutil para separar del fondo
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    // Sombra interna sutil
    shadowColor: 'rgba(0, 0, 0, 0.02)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  offerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
    // Efecto 3D para el título
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  offerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  featuresContainer: {
    marginBottom: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  featureText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: COLORS.primary,
    // Efecto 3D para el precio
    textShadowColor: 'rgba(79, 172, 254, 0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minWidth: 120, // Ancho mínimo para evitar botones estrechos
    // Efectos 3D para el botón
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    // Transform para profundidad
    transform: [{ perspective: 500 }, { rotateX: '1deg' }],
  },
  buyButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  
  // Popular Destinations
  // Section Header Styles
  sectionHeaderNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Destinations Container Styles
  destinationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  destinationCardNew: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: SPACING.sm,
  },
  destinationTouchable: {
    padding: SPACING.md,
    position: 'relative',
  },
  trendingBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  trendingText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 2,
  },
  destinationFlagContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  destinationFlagNew: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  destinationNameNew: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  destinationInfo: {
    marginBottom: SPACING.xs,
  },
  destinationPlansNew: {
    fontSize: 12,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 2,
  },
  destinationRegion: {
    fontSize: 11,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  destinationPriceContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  destinationPriceLabel: {
    fontSize: 11,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  destinationPriceNew: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  destinationRanking: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Original Destinations Grid
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  destinationCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  destinationFlag: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  destinationName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  destinationPlans: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  destinationPrice: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Plans List
  planCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  planCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  planInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  planFlag: {
    fontSize: 28,
  },
  planDetails: {
    flex: 1,
  },
  planName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  planSpecs: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
  planPricing: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  planPrice: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  
  offerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addToCartButtonSmall: {
    backgroundColor: COLORS.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  
  bottomSpacer: {
    height: 100,
  },
  
  // Quick Actions Styles
  quickActionsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  quickActionsTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: SPACING.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
  },

  // Sales Booster Styles
  salesBoosterSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  salesBoosterTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  salesBoosterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  salesBoosterCard: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  salesBoosterCardGradient: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  salesBoosterIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  salesBoosterCardTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  salesBoosterCardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    textAlign: 'center',
    fontWeight: '500',
  },
  urgentCTAButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  urgentCTAGradient: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  urgentCTAContent: {
    flex: 1,
  },
  urgentCTAText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  urgentCTASubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },

  // Enhanced Offers Section Styles
  offersTitleContainer: {
    flex: 1,
  },
  offersMainTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  offersSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    fontWeight: '600',
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: BORDER_RADIUS.sm,
  },
});

export default ShopScreen;
