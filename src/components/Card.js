import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../theme';

const Card = ({
    children,
    onPress,
    selected = false,
    elevation = 'small',
    padding = 'medium',
    style,
}) => {
    const Component = onPress ? TouchableOpacity : View;

    const cardStyles = [
        styles.base,
        theme.shadows[elevation],
        styles[`padding_${padding}`],
        selected && styles.selected,
        style,
    ];

    return (
        <Component
            style={cardStyles}
            onPress={onPress}
            activeOpacity={onPress ? 0.9 : 1}
        >
            {children}
        </Component>
    );
};

const styles = StyleSheet.create({
    base: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },

    selected: {
        borderColor: theme.colors.primary,
        backgroundColor: '#F0F5F9', // Very light blue tint
    },

    // Padding variants
    padding_none: {
        padding: 0,
    },
    padding_small: {
        padding: theme.spacing.sm,
    },
    padding_medium: {
        padding: theme.spacing.md,
    },
    padding_large: {
        padding: theme.spacing.lg,
    },
});

export default Card;
