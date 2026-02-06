// Typography system for Cricket Scorer App
import { Platform } from 'react-native';

// Font families
export const fontFamily = {
    regular: Platform.select({
        ios: 'System',
        android: 'Roboto',
    }),
    medium: Platform.select({
        ios: 'System',
        android: 'Roboto-Medium',
    }),
    bold: Platform.select({
        ios: 'System',
        android: 'Roboto-Bold',
    }),
};

// Font weights
export const fontWeight = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
};

// Font sizes
export const fontSize = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
};

// Line heights
export const lineHeight = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
};

// Typography variants
export const typography = {
    // Headings
    h1: {
        fontSize: fontSize['3xl'],
        fontWeight: fontWeight.bold,
        lineHeight: fontSize['3xl'] * lineHeight.tight,
    },
    h2: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        lineHeight: fontSize['2xl'] * lineHeight.tight,
    },
    h3: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
        lineHeight: fontSize.xl * lineHeight.normal,
    },
    h4: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        lineHeight: fontSize.lg * lineHeight.normal,
    },

    // Body text
    bodyLarge: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.regular,
        lineHeight: fontSize.lg * lineHeight.normal,
    },
    body: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.regular,
        lineHeight: fontSize.base * lineHeight.normal,
    },
    bodySmall: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.regular,
        lineHeight: fontSize.sm * lineHeight.normal,
    },

    // Labels
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        lineHeight: fontSize.sm * lineHeight.normal,
    },
    labelSmall: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        lineHeight: fontSize.xs * lineHeight.normal,
    },

    // Button text
    button: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        lineHeight: fontSize.base * lineHeight.tight,
    },
    buttonSmall: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        lineHeight: fontSize.sm * lineHeight.tight,
    },

    // Caption
    caption: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.regular,
        lineHeight: fontSize.xs * lineHeight.normal,
    },
};

export default typography;
