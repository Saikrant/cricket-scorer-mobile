// Spacing system for Cricket Scorer App
// Based on 4px grid

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
    '4xl': 64,
};

// Common padding presets
export const padding = {
    screen: spacing.lg,        // 24px for screen edges
    card: spacing.md,          // 16px for cards
    input: spacing.md,         // 16px for inputs
    button: spacing.md,        // 16px for buttons
    section: spacing.xl,       // 32px between sections
};

// Common margin presets
export const margin = {
    small: spacing.sm,         // 8px
    medium: spacing.md,        // 16px
    large: spacing.lg,         // 24px
};

// Border radius
export const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
};

export default {
    spacing,
    padding,
    margin,
    borderRadius,
};
