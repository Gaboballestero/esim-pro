import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HablarisLogoAnimatedProps {
  size?: number;
  style?: any;
  speed?: number; // Velocidad de la animación (1 = normal, 2 = doble velocidad)
}

const HablarisLogoAnimated: React.FC<HablarisLogoAnimatedProps> = ({ 
  size = 40, 
  style,
  speed = 1
}) => {
  // Valor animado principal que controla toda la animación
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Colores base para cada letra
  const colorSets = [
    [
      ['#FF8A80', '#FF5722'], // Conjunto 1
      ['#E91E63', '#9C27B0'], // Conjunto 2
      ['#673AB7', '#3F51B5'], // Conjunto 3
      ['#2196F3', '#00BCD4'], // Conjunto 4
    ],
    [
      ['#FF5722', '#E91E63'], // h
      ['#E91E63', '#9C27B0'], // a
      ['#9C27B0', '#673AB7'], // b
      ['#673AB7', '#3F51B5'], // l
    ],
    [
      ['#3F51B5', '#2196F3'], // a
      ['#2196F3', '#00BCD4'], // r
      ['#00BCD4', '#4CAF50'], // i
      ['#4CAF50', '#FF8A80'], // s
    ]
  ];

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000 / speed,
          useNativeDriver: false,
        }),
        { iterations: -1 }
      ).start();
    };

    startAnimation();
  }, [speed]);

  // Función para obtener colores animados basados en el índice
  const getColorsForLetter = (letterIndex: number) => {
    const setIndex = Math.floor((letterIndex / 8) * colorSets.length);
    const colorIndex = letterIndex % 4;
    
    // Rotamos entre los diferentes sets de colores
    const currentSet = colorSets[setIndex] || colorSets[0];
    const nextSet = colorSets[(setIndex + 1) % colorSets.length];
    
    return {
      startColor: currentSet[colorIndex] || currentSet[0],
      endColor: nextSet[colorIndex] || nextSet[0],
    };
  };

  const letters = ['h', 'a', 'b', 'l', 'a', 'r', 'i', 's'];
  const fontSize = size * 0.6;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.logoContainer, { gap: size * 0.1 }]}>
        {letters.map((letter, index) => {
          const { startColor, endColor } = getColorsForLetter(index);
          
          // Creamos un delay para cada letra
          const letterDelay = (index * 0.125); // 0, 0.125, 0.25, etc.
          
          // Interpolamos entre los colores basándose en el valor animado y el delay
          const progress = animatedValue.interpolate({
            inputRange: [letterDelay, letterDelay + 0.5, letterDelay + 1],
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.letterContainer,
                { 
                  height: fontSize * 1.2,
                  minWidth: fontSize * 0.8,
                  transform: [{
                    scale: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05],
                    })
                  }]
                }
              ]}
            >
              <LinearGradient
                colors={[startColor[0], startColor[1]]}
                style={styles.letterGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.Text 
                  style={[
                    styles.letter, 
                    { 
                      fontSize,
                      opacity: progress.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.8, 1, 0.8],
                      })
                    }
                  ]}
                >
                  {letter}
                </Animated.Text>
              </LinearGradient>
            </Animated.View>
          );
        })}
        
        {/* Ícono eSIM animado */}
        <Animated.View 
          style={[
            styles.iconContainer, 
            { 
              width: size * 0.5, 
              height: size * 0.5,
              transform: [{
                rotate: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }
          ]}
        >
          <LinearGradient
            colors={['#9C27B0', '#2196F3']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.simIcon}>
              <View style={styles.simCutout} />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
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
    borderRadius: 4,
    overflow: 'hidden',
  },
  letterGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  letter: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconContainer: {
    marginLeft: 6,
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
});

export default HablarisLogoAnimated;
