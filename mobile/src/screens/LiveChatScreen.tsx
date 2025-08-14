import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

type LiveChatScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'read';
}

interface ESIMContext {
  iccid: string;
  planName: string;
  status: string;
  dataUsed: number;
  dataTotal: number;
  validUntil: string;
  purchaseDate: string;
  planCountries: string;
}

const LiveChatScreen: React.FC = () => {
  const navigation = useNavigation<LiveChatScreenNavigationProp>();
  const route = useRoute();
  const routeParams = route.params as { esimContext?: ESIMContext; preloadMessage?: string } | undefined;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAgentOnline, setIsAgentOnline] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Check if there's preloaded eSIM context
    const esimContext = routeParams?.esimContext;
    const preloadMessage = routeParams?.preloadMessage;
    
    let initialMessage: ChatMessage;
    
    if (esimContext && preloadMessage) {
      // Initial greeting with eSIM context
      initialMessage = {
        id: '1',
        text: '¡Hola! Soy Sarah, tu asistente de soporte. He recibido la información de tu eSIM y estoy lista para ayudarte.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      
      // Add the preloaded message as if user sent it
      setTimeout(() => {
        const userMessage: ChatMessage = {
          id: '2',
          text: preloadMessage,
          isUser: true,
          timestamp: new Date(),
          status: 'sent',
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Simulate agent response
        setTimeout(() => {
          const agentResponse: ChatMessage = {
            id: '3',
            text: `Perfecto, veo que necesitas ayuda con tu eSIM ${esimContext.planName}. He revisado los detalles de tu plan y puedo asistirte. ¿Cuál es el problema específico que estás experimentando?\n\nPuedo ayudarte con:\n• Activación y configuración\n• Problemas de conectividad\n• Gestión de datos\n• Cambios de plan`,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, agentResponse]);
        }, 1500);
      }, 500);
    } else {
      // Default initial message
      initialMessage = {
        id: '1',
        text: '¡Hola! Soy Sarah, tu asistente de soporte. ¿En qué puedo ayudarte hoy?',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [routeParams]);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate message being sent
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    }, 1000);

    // Simulate agent response
    setTimeout(() => {
      generateBotResponse(inputText);
    }, 2000);
  };

  const generateBotResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    if (lowerMessage.includes('esim') || lowerMessage.includes('activar')) {
      response = 'Te puedo ayudar con la activación de tu eSIM. ¿Ya tienes el código QR? También puedes ir a "Mis eSIMs" y tocar "Activar" en tu plan.';
    } else if (lowerMessage.includes('datos') || lowerMessage.includes('internet')) {
      response = 'Para problemas de conectividad, asegúrate de que:\n\n• Datos móviles estén activados\n• Tengas cobertura en tu zona\n• La configuración APN sea correcta\n\n¿Has verificado estos puntos?';
    } else if (lowerMessage.includes('pago') || lowerMessage.includes('cobro')) {
      response = 'Puedo ayudarte con temas de facturación. ¿Se trata de un cobro no reconocido o necesitas información sobre tu último pago?';
    } else if (lowerMessage.includes('cambiar') || lowerMessage.includes('plan')) {
      response = 'Puedes cambiar o actualizar tu plan desde la sección "Gestión de Planes" en tu perfil. También puedo ayudarte a encontrar el plan perfecto para tu viaje. ¿A qué país viajas?';
    } else if (lowerMessage.includes('cancelar') || lowerMessage.includes('reembolso')) {
      response = 'Entiendo que quieres cancelar. Según nuestras políticas, puedes cancelar dentro de las primeras 24 horas si no has activado tu eSIM. ¿Tu eSIM ya está activada?';
    } else {
      response = 'Entiendo tu consulta. Para darte la mejor asistencia, ¿podrías contarme más detalles sobre el problema que estás experimentando?';
    }

    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const quickReplies = [
    { id: '1', text: 'Mi eSIM no funciona', icon: 'cellular-outline' },
    { id: '2', text: 'Problema con el pago', icon: 'card-outline' },
    { id: '3', text: 'Cambiar mi plan', icon: 'swap-horizontal-outline' },
    { id: '4', text: 'Cancelar servicio', icon: 'close-circle-outline' },
  ];

  const handleQuickReply = (text: string) => {
    setInputText(text);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message: ChatMessage) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isUser ? styles.userMessage : styles.botMessage
    ]}>
      {!message.isUser && (
        <View style={styles.agentAvatar}>
          <Text style={styles.agentInitial}>S</Text>
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userText : styles.botText
        ]}>
          {message.text}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            message.isUser ? styles.userTime : styles.botTime
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          
          {message.isUser && message.status && (
            <Ionicons 
              name={
                message.status === 'sending' ? 'time-outline' :
                message.status === 'sent' ? 'checkmark-outline' :
                'checkmark-done-outline'
              }
              size={12}
              color={message.status === 'read' ? COLORS.primary : COLORS.gray[400]}
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Chat en Vivo</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isAgentOnline ? COLORS.success : COLORS.gray[400] }
            ]} />
            <Text style={styles.statusText}>
              {isAgentOnline ? 'Sarah - En línea' : 'Agente desconectado'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Alert.alert('Llamada', 'Conectando con soporte telefónico...')}
        >
          <Ionicons name="call" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* eSIM Context Information */}
        {routeParams?.esimContext && (
          <View style={styles.esimContextContainer}>
            <View style={styles.esimContextHeader}>
              <Ionicons name="hardware-chip" size={20} color={COLORS.primary} />
              <Text style={styles.esimContextTitle}>Información del eSIM</Text>
            </View>
            <View style={styles.esimContextContent}>
              <View style={styles.esimContextRow}>
                <Text style={styles.esimContextLabel}>Plan:</Text>
                <Text style={styles.esimContextValue}>{routeParams.esimContext.planName}</Text>
              </View>
              <View style={styles.esimContextRow}>
                <Text style={styles.esimContextLabel}>ICCID:</Text>
                <Text style={styles.esimContextValue}>{routeParams.esimContext.iccid}</Text>
              </View>
              <View style={styles.esimContextRow}>
                <Text style={styles.esimContextLabel}>Estado:</Text>
                <Text style={[styles.esimContextValue, { color: routeParams.esimContext.status === 'active' ? COLORS.success : COLORS.error }]}>
                  {routeParams.esimContext.status === 'active' ? 'Activa' : 'Inactiva'}
                </Text>
              </View>
              <View style={styles.esimContextRow}>
                <Text style={styles.esimContextLabel}>Datos:</Text>
                <Text style={styles.esimContextValue}>
                  {routeParams.esimContext.dataUsed}GB / {routeParams.esimContext.dataTotal}GB
                </Text>
              </View>
            </View>
          </View>
        )}

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.botMessage]}>
              <View style={styles.agentAvatar}>
                <Text style={styles.agentInitial}>S</Text>
              </View>
              <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Replies */}
        {messages.length === 1 && (
          <View style={styles.quickRepliesContainer}>
            <Text style={styles.quickRepliesTitle}>Respuestas rápidas:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickReplies.map((reply) => (
                <TouchableOpacity
                  key={reply.id}
                  style={styles.quickReply}
                  onPress={() => handleQuickReply(reply.text)}
                >
                  <Ionicons name={reply.icon as any} size={16} color={COLORS.primary} />
                  <Text style={styles.quickReplyText}>{reply.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => Alert.alert('Adjuntar', 'Selecciona una imagen o documento')}
          >
            <Ionicons name="attach" size={24} color={COLORS.gray[500]} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor={COLORS.gray[400]}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? COLORS.primary : COLORS.gray[300] }
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? COLORS.white : COLORS.gray[500]} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  agentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  agentInitial: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.xl,
  },
  botBubble: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  typingBubble: {
    paddingVertical: SPACING.md,
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 20,
  },
  userText: {
    color: COLORS.white,
  },
  botText: {
    color: COLORS.gray[900],
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTime: {
    color: COLORS.gray[500],
  },
  statusIcon: {
    marginLeft: SPACING.xs,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray[400],
    marginHorizontal: 2,
  },
  quickRepliesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  quickRepliesTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  quickReply: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  quickReplyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[700],
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[900],
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  esimContextContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  esimContextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  esimContextTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  esimContextContent: {
    gap: SPACING.xs,
  },
  esimContextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  esimContextLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  esimContextValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[900],
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});

export default LiveChatScreen;
