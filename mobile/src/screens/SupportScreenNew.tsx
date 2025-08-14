import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Linking,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import SupportService from '../services/SupportService';

const SupportScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'chat' | 'ticket' | 'contact'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [faqs, setFaqs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium',
  });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar FAQs populares
      const faqData = await SupportService.getPopularFAQs();
      setFaqs(faqData);
      
      // Cargar tickets del usuario
      const ticketsData = await SupportService.getTickets();
      setTickets(ticketsData.results || []);
      
      // Cargar información de contacto
      const contact = await SupportService.getContactInfo();
      setContactInfo(contact);
      
    } catch (error) {
      console.error('Error loading support data:', error);
      Alert.alert('Error', 'No se pudo cargar la información de soporte');
    } finally {
      setLoading(false);
    }
  };

  const supportOptions = [
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: contactInfo?.response_time?.whatsapp || 'Respuesta inmediata',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => openWhatsApp(),
    },
    {
      id: 'email',
      title: 'Email',
      subtitle: contactInfo?.email || 'soporte@esimpro.com',
      icon: 'mail-outline',
      color: COLORS.primary,
      action: () => openEmail(),
    },
    {
      id: 'telegram',
      title: 'Telegram',
      subtitle: contactInfo?.response_time?.telegram || 'Respuesta inmediata',
      icon: 'send-outline',
      color: '#0088cc',
      action: () => openTelegram(),
    },
    {
      id: 'phone',
      title: 'Teléfono',
      subtitle: contactInfo?.phone || '+1 (555) 123-4567',
      icon: 'call-outline',
      color: COLORS.success,
      action: () => makeCall(),
    },
  ];

  const openWhatsApp = async () => {
    try {
      if (contactInfo?.whatsapp) {
        const url = `https://wa.me/${contactInfo.whatsapp}?text=${encodeURIComponent('Hola, necesito ayuda con mi eSIM')}`;
        await Linking.openURL(url);
      } else {
        Alert.alert('WhatsApp no disponible', 'El soporte por WhatsApp no está configurado');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir WhatsApp');
    }
  };

  const openTelegram = async () => {
    try {
      if (contactInfo?.telegram) {
        const url = `https://t.me/${contactInfo.telegram}`;
        await Linking.openURL(url);
      } else {
        Alert.alert('Telegram no disponible', 'El soporte por Telegram no está configurado');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir Telegram');
    }
  };

  const openEmail = async () => {
    try {
      const email = contactInfo?.email || 'soporte@esimpro.com';
      const subject = encodeURIComponent('Soporte Hablaris');
      const body = encodeURIComponent('Hola,\n\nNecesito ayuda con mi eSIM.\n\nDescripción del problema:\n\n\nGracias');
      const url = `mailto:${email}?subject=${subject}&body=${body}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el cliente de email');
    }
  };

  const makeCall = async () => {
    try {
      if (contactInfo?.phone) {
        const phoneUrl = `tel:${contactInfo.phone}`;
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Teléfono no disponible', 'El soporte telefónico no está configurado');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la llamada');
    }
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const createTicket = async () => {
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await SupportService.createTicket({
        subject: ticketForm.subject,
        description: ticketForm.description,
        priority: ticketForm.priority,
        device_info: Platform.OS,
        app_version: '1.0.0',
      });

      Alert.alert('Éxito', 'Tu ticket ha sido creado. Te responderemos pronto.');
      setShowTicketModal(false);
      setTicketForm({ subject: '', description: '', priority: 'medium' });
      
      // Recargar tickets
      const ticketsData = await SupportService.getTickets();
      setTickets(ticketsData.results || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'faq', title: 'FAQ', icon: 'help-circle-outline' },
        { key: 'chat', title: 'Chat', icon: 'chatbubble-outline' },
        { key: 'ticket', title: 'Ticket', icon: 'receipt-outline' },
        { key: 'contact', title: 'Contacto', icon: 'call-outline' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={activeTab === tab.key ? COLORS.primary : COLORS.gray[600]}
          />
          <Text style={[
            styles.tabText,
            activeTab === tab.key && styles.activeTabText
          ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFAQTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en preguntas frecuentes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray[400]}
        />
      </View>

      <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando FAQs...</Text>
        </View>
      ) : (
        filteredFAQs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqCard}
            onPress={() => toggleFAQ(faq.id.toString())}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expandedFAQ === faq.id.toString() ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.gray[600]}
              />
            </View>
            {expandedFAQ === faq.id.toString() && (
              <Animated.View style={styles.faqAnswer}>
                <Text style={styles.faqAnswerText}>{faq.answer}</Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderChatTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Chat en Vivo</Text>
      <View style={styles.chatComingSoon}>
        <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray[400]} />
        <Text style={styles.comingSoonTitle}>Chat en Vivo</Text>
        <Text style={styles.comingSoonText}>
          El chat en vivo estará disponible próximamente.
          Mientras tanto, puedes contactarnos por WhatsApp o Telegram.
        </Text>
        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
          <Text style={styles.whatsappButtonText}>Ir a WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTicketTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.ticketHeader}>
        <Text style={styles.sectionTitle}>Mis Tickets</Text>
        <TouchableOpacity
          style={styles.createTicketButton}
          onPress={() => setShowTicketModal(true)}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.createTicketText}>Crear Ticket</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando tickets...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={COLORS.gray[400]} />
          <Text style={styles.emptyStateTitle}>No tienes tickets</Text>
          <Text style={styles.emptyStateText}>
            Crea tu primer ticket de soporte para obtener ayuda
          </Text>
        </View>
      ) : (
        tickets.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketId}>#{ticket.ticket_id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                <Text style={styles.statusText}>{ticket.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.ticketSubject}>{ticket.subject}</Text>
            <Text style={styles.ticketDate}>
              {new Date(ticket.created_at).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderContactTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Contactanos</Text>
      <Text style={styles.sectionSubtitle}>
        Elige el método que prefieras para contactar con nuestro equipo de soporte
      </Text>

      <View style={styles.contactOptions}>
        {supportOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.contactOption}
            onPress={option.action}
          >
            <View style={[styles.contactIcon, { backgroundColor: option.color }]}>
              <Ionicons name={option.icon as any} size={24} color={COLORS.white} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        ))}
      </View>

      {contactInfo?.hours && (
        <View style={styles.hoursCard}>
          <Ionicons name="time-outline" size={20} color={COLORS.primary} />
          <Text style={styles.hoursText}>Horarios de atención: {contactInfo.hours}</Text>
        </View>
      )}
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return COLORS.warning;
      case 'in_progress': return COLORS.info;
      case 'resolved': return COLORS.success;
      case 'closed': return COLORS.gray[500];
      default: return COLORS.gray[500];
    }
  };

  const renderTicketModal = () => (
    <Modal
      visible={showTicketModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowTicketModal(false)}>
            <Ionicons name="close" size={24} color={COLORS.gray[600]} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Crear Ticket</Text>
          <TouchableOpacity onPress={createTicket} disabled={loading}>
            <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
              {loading ? 'Creando...' : 'Crear'}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.modalContent}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Asunto</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Describe brevemente tu problema"
                value={ticketForm.subject}
                onChangeText={(text) => setTicketForm({ ...ticketForm, subject: text })}
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Prioridad</Text>
              <View style={styles.priorityOptions}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      ticketForm.priority === priority && styles.priorityOptionActive
                    ]}
                    onPress={() => setTicketForm({ ...ticketForm, priority })}
                  >
                    <Text style={[
                      styles.priorityText,
                      ticketForm.priority === priority && styles.priorityTextActive
                    ]}>
                      {priority === 'low' ? 'Baja' : priority === 'medium' ? 'Media' : 'Alta'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Describe detalladamente tu problema..."
                value={ticketForm.description}
                onChangeText={(text) => setTicketForm({ ...ticketForm, description: text })}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Soporte</Text>
          <Text style={styles.subtitle}>
            Estamos aquí para ayudarte 24/7
          </Text>
        </Animated.View>
      </LinearGradient>

      {renderTabBar()}
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {activeTab === 'faq' && renderFAQTab()}
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'ticket' && renderTicketTab()}
        {activeTab === 'contact' && renderContactTab()}
      </Animated.View>

      {renderTicketModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.white,
    opacity: 0.9,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '10',
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[800],
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.gray[800],
    marginBottom: SPACING.md,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[600],
    marginTop: SPACING.sm,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray[800],
    flex: 1,
    marginRight: SPACING.sm,
  },
  faqAnswer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  faqAnswerText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  chatComingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  comingSoonTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.gray[800],
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  comingSoonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  whatsappButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  createTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  createTicketText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.gray[800],
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  ticketId: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[600],
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  ticketSubject: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray[800],
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  ticketDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
  },
  contactOptions: {
    marginBottom: SPACING.lg,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray[800],
    marginBottom: 2,
  },
  contactSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[600],
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  hoursText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[600],
    marginLeft: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.gray[800],
  },
  saveButton: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
  },
  saveButtonDisabled: {
    color: COLORS.gray[400],
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray[800],
    marginBottom: SPACING.sm,
  },
  formInput: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...TYPOGRAPHY.body2,
    color: COLORS.gray[800],
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  priorityOption: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  priorityOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priorityText: {
    ...TYPOGRAPHY.button,
    color: COLORS.gray[600],
  },
  priorityTextActive: {
    color: COLORS.white,
  },
});

export default SupportScreen;
