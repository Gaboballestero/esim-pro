import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HablarisLogoFlowingProps {
  size?: number;
  style?: any;
  speed?: number;
}

const HablarisLogoFlowing: React.FC<HablarisLogoFlowingProps> = ({ 
  size = 60, 
  style,
  speed = 1
}) => {
  const rotationAnimatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnimatedValue = useRef(new Animated.Value(1)).current;
  const colorAnimatedValue = useRef(new Animated.Value(0)).current;

  // Paleta de colores vibrantes que fluirán
  const flowingColors = [
    '#FF6B35', // Naranja vibrante
    '#F7931E', // Naranja dorado
    '#FFD23F', // Amarillo brillante
    '#06FFA5', // Verde neón
    '#2E8B57', // Verde esmeralda
    '#0099CC', // Azul brillante
    '#6495ED', // Azul acero
    '#8A2BE2', // Azul violeta
    '#DA70D6', // Orquídea
    '#FF69B4', // Rosa intenso
  ];

  useEffect(() => {
    // Animación de rotación suave
    const rotationAnimation = Animated.loop(
      Animated.timing(rotationAnimatedValue, {
        toValue: 1,
        duration: 8000 / speed,
        useNativeDriver: true,
      })
    );

    // Animación de pulso
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimatedValue, {
          toValue: 1.15,
          duration: 1500 / speed,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimatedValue, {
          toValue: 1,
          duration: 1500 / speed,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de cambio de colores
    const colorAnimation = Animated.loop(
      Animated.timing(colorAnimatedValue, {
        toValue: 1,
        duration: 4000 / speed,
        useNativeDriver: false,
      })
    );

    rotationAnimation.start();
    pulseAnimation.start();
    colorAnimation.start();

    return () => {
      rotationAnimation.stop();
      pulseAnimation.stop();
      colorAnimation.stop();
    };
  }, [speed]);

  const rotation = rotationAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getAnimatedColors = (): [string, string, string] => {
    // Retornamos colores estáticos que se ven bien
    return ['#FF6B35', '#8A2BE2', '#06FFA5'];
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            width: size * 1.5,
            height: size * 1.5,
            transform: [
              { scale: pulseAnimatedValue },
              { rotate: rotation },
            ],
          }
        ]}
      >
        <LinearGradient
          colors={getAnimatedColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              width: size * 1.5,
              height: size * 1.5,
              borderRadius: (size * 1.5) / 2,
            }
          ]}
        >
          <MaterialIcons 
            name="sim-card" 
            size={size} 
            color="white" 
            style={styles.icon}
          />
        </LinearGradient>
        
        {/* Anillo exterior animado */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              width: size * 1.8,
              height: size * 1.8,
              borderRadius: (size * 1.8) / 2,
              borderWidth: 3,
              opacity: colorAnimatedValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 0.8, 0.3],
              }),
            }
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  outerRing: {
    position: 'absolute',
    borderColor: '#FF6B35',
    borderStyle: 'solid',
  },
});

export default HablarisLogoFlowing;
