import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HablarisLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showText?: boolean;
  style?: any;
}

const HablarisLogo: React.FC<HablarisLogoProps> = ({ 
  size = 'medium', 
  showText = true,
  style 
}) => {
  const getSizes = () => {
    switch (size) {
      case 'small':
        return { fontSize: 20, iconSize: 16, spacing: 4 };
      case 'medium':
        return { fontSize: 28, iconSize: 20, spacing: 6 };
      case 'large':
        return { fontSize: 36, iconSize: 24, spacing: 8 };
      case 'xlarge':
        return { fontSize: 48, iconSize: 32, spacing: 10 };
      default:
        return { fontSize: 28, iconSize: 20, spacing: 6 };
    }
  };

  const { fontSize, iconSize, spacing } = getSizes();

  const getGradientColors = (letterIndex: number): [string, string] => {
    const gradients: [string, string][] = [
      ['#FF8A80', '#FF5722'], // h - naranja-rojo
      ['#FF8A80', '#E91E63'], // a - naranja-rosa
      ['#E91E63', '#9C27B0'], // b - rosa-púrpura  
      ['#9C27B0', '#673AB7'], // l - púrpura
      ['#673AB7', '#3F51B5'], // a - púrpura-azul
      ['#3F51B5', '#2196F3'], // r - azul
      ['#2196F3', '#00BCD4'], // i - azul claro
      ['#00BCD4', '#9C27B0'], // s - cian-púrpura
    ];
    return gradients[letterIndex] || ['#9C27B0', '#2196F3'];
  };

  const letters = ['h', 'a', 'b', 'l', 'a', 'r', 'i', 's'];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.logoContainer, { gap: spacing }]}>
        {letters.map((letter, index) => (
          <LinearGradient
            key={index}
            colors={getGradientColors(index)}
            style={[styles.letterContainer, { height: fontSize * 1.2 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.letter, { fontSize }]}>
              {letter}
            </Text>
          </LinearGradient>
        ))}
        
        {/* Ícono eSIM integrado */}
        <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
          <LinearGradient
            colors={['#9C27B0', '#E91E63']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.simIcon}>
              <View style={styles.simCutout} />
            </View>
          </LinearGradient>
        </View>
      </View>
      
      {showText && (
        <Text style={[styles.tagline, { fontSize: fontSize * 0.4 }]}>
          eSIM
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  letter: {
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconContainer: {
    marginLeft: 4,
    borderRadius: 3,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simIcon: {
    width: '70%',
    height: '70%',
    backgroundColor: 'white',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simCutout: {
    width: '60%',
    height: '30%',
    backgroundColor: '#9C27B0',
    borderRadius: 1,
  },
  tagline: {
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default HablarisLogo;
