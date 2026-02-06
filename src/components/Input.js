import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import theme from '../theme';

const Input = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    error,
    leftIcon,
    rightIcon,
    multiline = false,
    style,
    inputStyle,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
                error && styles.inputWrapperError,
            ]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        leftIcon && styles.inputWithLeftIcon,
                        rightIcon && styles.inputWithRightIcon,
                        multiline && styles.inputMultiline,
                        inputStyle,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textTertiary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={multiline}
                    {...props}
                />

                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },

    label: {
        ...theme.typography.label,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.md,
        minHeight: 56,
    },

    inputWrapperFocused: {
        borderColor: theme.colors.borderFocus,
        borderWidth: 1.5,
    },

    inputWrapperError: {
        borderColor: theme.colors.error,
    },

    input: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.textPrimary,
        paddingVertical: theme.spacing.md,
    },

    inputWithLeftIcon: {
        paddingLeft: theme.spacing.sm,
    },

    inputWithRightIcon: {
        paddingRight: theme.spacing.sm,
    },

    inputMultiline: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: theme.spacing.md,
    },

    leftIcon: {
        marginRight: theme.spacing.sm,
    },

    rightIcon: {
        marginLeft: theme.spacing.sm,
    },

    errorText: {
        ...theme.typography.caption,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
        marginLeft: theme.spacing.xs,
    },
});

export default Input;
