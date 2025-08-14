import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HablarisLogoFlowingProps {
  size?: number;
  style?: any;
  speed?: number;
}

const HablarisLogoFlowing: React.FC<HablarisLogoFlowingProps> = ({ 
  size = 40, 
  style,
  speed = 1
}) => {
  const waveAnimatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnimatedValue = useRef(new Animated.Value(0)).current;

  // Paleta de colores que fluirán
  const flowingColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#FD79A8',
    '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E'
  ];

  useEffect(() => {
    // Animación de onda que fluye
    const waveAnimation = Animated.loop(
      Animated.timing(waveAnimatedValue, {
        toValue: 1,
        duration: 4000 / speed,
        useNativeDriver: false,
      }),
      { iterations: -1 }
    );

    // Animación de pulso sutil
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimatedValue, {
          toValue: 1,
          duration: 1500 / speed,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnimatedValue, {
          toValue: 0,
          duration: 1500 / speed,
          useNativeDriver: false,
        }),
      ]),
      { iterations: -1 }
    );

    waveAnimation.start();
    pulseAnimation.start();

    return () => {
      waveAnimation.stop();
      pulseAnimation.stop();
    };
  }, [speed]);

  const letters = ['h', 'a', 'b', 'l', 'a', 'r', 'i', 's'];
  const fontSize = size * 0.6;

  const getFlowingColors = (letterIndex: number): [string, string] => {
    // Calculamos colores con el offset
    const primaryColorIndex = Math.floor((letterIndex + 0) % flowingColors.length);
    const secondaryColorIndex = Math.floor((letterIndex + 2) % flowingColors.length);
    
    return [
      flowingColors[primaryColorIndex],
      flowingColors[secondaryColorIndex]
    ];
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.logoContainer, { gap: size * 0.1 }]}>
        {letters.map((letter, index) => {
          const colors = getFlowingColors(index);
          
          // Efecto de onda: cada letra se activa con un delay
          const waveProgress = waveAnimatedValue.interpolate({
            inputRange: [0, 0.125 * index, 0.125 * index + 0.25, 1],
            outputRange: [0, 0, 1, 0],
            extrapolate: 'clamp',
          });

          // Efecto de pulso global
          const pulseScale = pulseAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.08],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.letterContainer,
                { 
                  height: fontSize * 1.2,
                  minWidth: fontSize * 0.8,
                  transform: [
                    { scale: pulseScale },
                    {
                      scale: waveProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                      })
                    }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={colors}
                style={styles.letterGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.Text 
                  style={[
                    styles.letter, 
                    { 
                      fontSize,
                      opacity: waveProgress.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.7, 1, 0.7],
                      }),
                      textShadowColor: waveProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(0,0,0,0.3)' as any, 'rgba(255,255,255,0.8)' as any],
                      }) as any,
                    }
                  ]}
                >
                  {letter}
                </Animated.Text>
              </LinearGradient>
              
              {/* Efecto de brillo que pasa por encima */}
              <Animated.View
                style={[
                  styles.glowOverlay,
                  {
                    opacity: waveProgress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.3, 0],
                    }),
                  }
                ]}
              />
            </Animated.View>
          );
        })}
        
        {/* Ícono eSIM con rotación y colores cambiantes */}
        <Animated.View 
          style={[
            styles.iconContainer, 
            { 
              width: size * 0.5, 
              height: size * 0.5,
              transform: [
                {
                  rotate: waveAnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                },
                { scale: pulseAnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  })
                }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#6C5CE7', '#A29BFE']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.simIcon}>
              <Animated.View 
                style={[
                  styles.simCutout,
                  {
                    backgroundColor: waveAnimatedValue.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['#9C27B0' as any, '#2196F3' as any, '#9C27B0' as any],
                    }) as any,
                  }
                ]} 
              />
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
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
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
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 6,
  },
  iconContainer: {
    marginLeft: 8,
    borderRadius: 8,
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
    borderRadius: 2,
  },
});

export default HablarisLogoFlowing;
