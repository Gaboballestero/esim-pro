import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';

interface ESIMHelpButtonProps {
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const ESIMHelpButton = ({ 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  showText = true 
}: ESIMHelpButtonProps) => {
  const getButtonStyle = () => {
    let buttonStyle = { ...styles.button };
    
    switch (variant) {
      case 'primary':
        buttonStyle = { ...buttonStyle, ...styles.primaryButton };
        break;
      case 'secondary':
        buttonStyle = { ...buttonStyle, ...styles.secondaryButton };
        break;
      case 'minimal':
        buttonStyle = { ...buttonStyle, ...styles.minimalButton };
        break;
    }

    switch (size) {
      case 'small':
        buttonStyle = { ...buttonStyle, ...styles.smallButton };
        break;
      case 'large':
        buttonStyle = { ...buttonStyle, ...styles.largeButton };
        break;
      default:
        buttonStyle = { ...buttonStyle, ...styles.mediumButton };
    }

    return buttonStyle;
  };

  const getTextStyle = () => {
    let textStyle = { ...styles.buttonText };
    
    switch (variant) {
      case 'primary':
        textStyle = { ...textStyle, ...styles.primaryText };
        break;
      case 'secondary':
        textStyle = { ...textStyle, ...styles.secondaryText };
        break;
      case 'minimal':
        textStyle = { ...textStyle, ...styles.minimalText };
        break;
    }

    switch (size) {
      case 'small':
        textStyle = { ...textStyle, ...styles.smallText };
        break;
      case 'large':
        textStyle = { ...textStyle, ...styles.largeText };
        break;
    }

    return textStyle;
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary': return COLORS.white;
      case 'secondary': return COLORS.primary;
      case 'minimal': return COLORS.primary;
      default: return COLORS.white;
    }
  };

  return (
    <TouchableOpacity style={getButtonStyle()} onPress={onPress}>
      <Ionicons 
        name="help-circle" 
        size={getIconSize()} 
        color={getIconColor()} 
      />
      {showText && (
        <Text style={getTextStyle()}>
          Guía de Instalación
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Componente para mostrar en el perfil
export const ProfileESIMGuide = ({ navigation }: { navigation: any }) => {
  const openGuide = () => {
    navigation.navigate('ESIMGuide');
  };

  return (
    <View style={styles.profileSection}>
      <View style={styles.profileHeader}>
        <Ionicons name="library" size={24} color={COLORS.primary} />
        <Text style={styles.profileTitle}>Guías y Soporte</Text>
      </View>
      
      <TouchableOpacity style={styles.profileItem} onPress={openGuide}>
        <View style={styles.profileItemContent}>
          <Ionicons name="phone-portrait" size={20} color={COLORS.gray[600]} />
          <View style={styles.profileItemText}>
            <Text style={styles.profileItemTitle}>Guía de Instalación eSIM</Text>
            <Text style={styles.profileItemSubtitle}>
              Aprende a instalar y activar tu eSIM paso a paso
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.profileItem} 
        onPress={() => navigation.navigate('ESIMGuide', { provider: '1global' })}
      >
        <View style={styles.profileItemContent}>
          <Ionicons name="globe" size={20} color={COLORS.gray[600]} />
          <View style={styles.profileItemText}>
            <Text style={styles.profileItemTitle}>Configuración por Proveedor</Text>
            <Text style={styles.profileItemSubtitle}>
              Instrucciones específicas para cada operador
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.profileItem} 
        onPress={() => navigation.navigate('ESIMGuide', { activeStep: 'troubleshooting' })}
      >
        <View style={styles.profileItemContent}>
          <Ionicons name="build" size={20} color={COLORS.gray[600]} />
          <View style={styles.profileItemText}>
            <Text style={styles.profileItemTitle}>Solución de Problemas</Text>
            <Text style={styles.profileItemSubtitle}>
              Resuelve problemas comunes con tu eSIM
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Botón de ayuda estilos
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  minimalButton: {
    backgroundColor: 'transparent',
  },
  smallButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  mediumButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  largeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  minimalText: {
    color: COLORS.primary,
  },
  smallText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 16,
  },

  // Estilos del perfil
  profileSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginLeft: 12,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  profileItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemText: {
    marginLeft: 12,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
});

export default ESIMHelpButton;
