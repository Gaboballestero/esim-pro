import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HablarisLogoSimpleProps {
  size?: number;
  style?: any;
  variant?: 'full' | 'icon' | 'text';
}

const HablarisLogoSimple: React.FC<HablarisLogoSimpleProps> = ({ 
  size = 32, 
  style,
  variant = 'full'
}) => {
  
  if (variant === 'icon') {
    // Solo el ícono eSIM
    return (
      <View style={[styles.iconOnly, { width: size, height: size }, style]}>
        <LinearGradient
          colors={['#FF8A80', '#9C27B0', '#2196F3']}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.simIcon}>
            <View style={styles.simCutout} />
          </View>
        </LinearGradient>
      </View>
    );
  }
  
  if (variant === 'text') {
    // Solo el texto con gradiente
    return (
      <View style={[styles.textOnly, style]}>
        <LinearGradient
          colors={['#FF8A80', '#E91E63', '#9C27B0', '#2196F3']}
          style={styles.textGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.logoText, { fontSize: size * 0.6 }]}>
            Hablaris
          </Text>
        </LinearGradient>
      </View>
    );
  }
  
  // Versión completa compacta
  return (
    <View style={[styles.fullCompact, style]}>
      <LinearGradient
        colors={['#FF8A80', '#9C27B0', '#2196F3']}
        style={[styles.compactContainer, { height: size }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.compactText, { fontSize: size * 0.5 }]}>
          Hablaris
        </Text>
        <View style={[styles.compactIcon, { width: size * 0.3, height: size * 0.3 }]}>
          <View style={styles.simIconSmall}>
            <View style={styles.simCutoutSmall} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  // Variante solo ícono
  iconOnly: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simIcon: {
    width: '60%',
    height: '60%',
    backgroundColor: 'white',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simCutout: {
    width: '50%',
    height: '25%',
    backgroundColor: '#9C27B0',
    borderRadius: 2,
  },
  
  // Variante solo texto
  textOnly: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  textGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoText: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  
  // Variante completa compacta
  fullCompact: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  compactText: {
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  compactIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simIconSmall: {
    width: '70%',
    height: '70%',
    backgroundColor: 'white',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simCutoutSmall: {
    width: '60%',
    height: '30%',
    backgroundColor: '#9C27B0',
    borderRadius: 1,
  },
});

export default HablarisLogoSimple;
