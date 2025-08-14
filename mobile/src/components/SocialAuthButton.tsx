import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';

interface SocialAuthButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  type: 'google' | 'apple';
}

const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
  type,
}) => {
  const isGoogle = type === 'google';
  const isApple = type === 'apple';

  const buttonStyles = [
    styles.button,
    isGoogle && styles.googleButton,
    isApple && styles.appleButton,
    disabled && styles.disabled,
  ];

  const textStyles = [
    styles.buttonText,
    isGoogle && styles.googleText,
    isApple && styles.appleText,
  ];

  const iconName = isGoogle ? 'logo-google' : 'logo-apple';
  const iconColor = isGoogle ? '#DB4437' : COLORS.white;
  const buttonText = isGoogle ? 'Continuar con Google' : 'Continuar con Apple';

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isGoogle ? COLORS.gray[600] : COLORS.white}
          />
        ) : (
          <Ionicons name={iconName} size={20} color={iconColor} />
        )}
        
        <Text style={textStyles}>
          {loading ? 'Iniciando sesión...' : buttonText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface SocialAuthSectionProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  googleLoading?: boolean;
  appleLoading?: boolean;
  showApple?: boolean;
}

export const SocialAuthSection: React.FC<SocialAuthSectionProps> = ({
  onGooglePress,
  onApplePress,
  googleLoading = false,
  appleLoading = false,
  showApple = Platform.OS === 'ios',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>O continúa con</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        <SocialAuthButton
          type="google"
          onPress={onGooglePress}
          loading={googleLoading}
          disabled={appleLoading}
        />

        {showApple && (
          <SocialAuthButton
            type="apple"
            onPress={onApplePress}
            loading={appleLoading}
            disabled={googleLoading}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[300],
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  socialButtons: {
    gap: SPACING.md,
  },
  button: {
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  googleButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray[300],
  },
  appleButton: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  googleText: {
    color: COLORS.gray[700],
  },
  appleText: {
    color: COLORS.white,
  },
});

export default SocialAuthButton;
