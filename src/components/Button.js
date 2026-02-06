import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../theme';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
}) => {
    const buttonStyles = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`textSize_${size}`],
        disabled && styles.textDisabled,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? theme.colors.white : theme.colors.primary}
                    size="small"
                />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    // Variants
    primary: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.small,
    },
    secondary: {
        backgroundColor: theme.colors.secondary,
        ...theme.shadows.small,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    text: {
        backgroundColor: 'transparent',
    },

    // Sizes
    size_small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
    },
    size_medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 48,
    },
    size_large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: 56,
    },

    // Disabled state
    disabled: {
        opacity: 0.5,
    },

    // Text styles
    text_primary: {
        color: theme.colors.white,
        ...theme.typography.button,
    },
    text_secondary: {
        color: theme.colors.white,
        ...theme.typography.button,
    },
    text_outline: {
        color: theme.colors.primary,
        ...theme.typography.button,
    },
    text_text: {
        color: theme.colors.primary,
        ...theme.typography.button,
    },

    // Text sizes
    textSize_small: {
        ...theme.typography.buttonSmall,
    },
    textSize_medium: {
        ...theme.typography.button,
    },
    textSize_large: {
        ...theme.typography.button,
    },

    textDisabled: {
        opacity: 1,
    },
});

export default Button;
