import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../components/Input';
import Button from '../components/Button';
import theme from '../theme';
import { useAuth } from '../contexts/AuthContext';
import matchService from '../services/matchService';

const CreateMatchScreen = ({ navigation }) => {
    const { profile } = useAuth();
    const [matchType, setMatchType] = useState('individual');
    const [matchName, setMatchName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Template state
    const [templates, setTemplates] = useState([]);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        if (profile?.id) {
            const { templates: loadedTemplates } = await matchService.getMatchTemplates(profile.id);
            setTemplates(loadedTemplates || []);
        }
    };

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        setMatchName(template.match_name || template.template_name || '');
        setLocation(template.location || '');
        setShowTemplatesModal(false);
    };

    const formatDate = (date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if date is today
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        // Check if date is tomorrow
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        // Otherwise show formatted date
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (time) => {
        return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    const handleContinue = () => {
        if (!matchName.trim()) {
            Alert.alert('Required', 'Please enter a match name');
            return;
        }

        // Navigate to Match Setup with match details
        navigation.navigate('MatchSetup', {
            matchDetails: {
                match_name: matchName,
                location: location,
                match_date: date.toISOString().split('T')[0],
                match_time: time.toTimeString().split(' ')[0].substring(0, 5),
                match_type: matchType,
            },
            // Pass template data if selected
            selectedTemplate: selectedTemplate,
        });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.dark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Create</Text>
                    <Text style={styles.headerTitle}>Match</Text>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Match Type Toggle */}
                <View style={styles.toggleContainer}>
                    {/* <TouchableOpacity
                        style={[styles.toggleButton, matchType === 'team' && styles.toggleButtonActive]}
                        onPress={() => setMatchType('team')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleText, matchType === 'team' && styles.toggleTextActive]}>
                            Team Match
                        </Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                        style={[styles.toggleButton, matchType === 'individual' && styles.toggleButtonActive]}
                        onPress={() => setMatchType('individual')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleText, matchType === 'individual' && styles.toggleTextActive]}>
                            Individual Match
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Load Previous Template Button */}
                {templates.length > 0 && (
                    <TouchableOpacity
                        style={styles.loadTemplateButton}
                        onPress={() => setShowTemplatesModal(true)}
                    >
                        <Ionicons name="folder-open-outline" size={20} color={theme.colors.primary} />
                        <Text style={styles.loadTemplateText}>
                            {selectedTemplate ? `Loaded: ${selectedTemplate.template_name}` : 'Load Previous Match'}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                )}

                {/* Templates Modal */}
                <Modal
                    visible={showTemplatesModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowTemplatesModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Load Previous Match</Text>
                                <TouchableOpacity onPress={() => setShowTemplatesModal(false)}>
                                    <Ionicons name="close" size={24} color={theme.colors.dark} />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={templates}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.templateItem}
                                        onPress={() => handleSelectTemplate(item)}
                                    >
                                        <View style={styles.templateInfo}>
                                            <Text style={styles.templateName}>{item.template_name}</Text>
                                            <Text style={styles.templateMeta}>
                                                {item.overs_per_player} overs/player • {item.player_names?.length || 0} players
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>No saved templates</Text>
                                }
                            />
                        </View>
                    </View>
                </Modal>

                {/* Match Name */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Match Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="trophy" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                        <Input
                            placeholder="Sunday Friendly"
                            value={matchName}
                            onChangeText={setMatchName}
                            style={styles.input}
                        />
                    </View>
                </View>

                {/* Location */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Location</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="location" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                        <Input
                            placeholder="City Sports Complex"
                            value={location}
                            onChangeText={setLocation}
                            style={styles.input}
                        />
                    </View>
                </View>

                {/* Date and Time Row */}
                <View style={styles.row}>
                    {/* Date */}
                    <View style={[styles.inputSection, styles.halfWidth]}>
                        <Text style={styles.label}>Date</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="calendar" size={20} color={theme.colors.textTertiary} />
                            <Text style={styles.pickerText}>{formatDate(date)}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Time */}
                    <View style={[styles.inputSection, styles.halfWidth]}>
                        <Text style={styles.label}>Time</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowTimePicker(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="time" size={20} color={theme.colors.textTertiary} />
                            <Text style={styles.pickerText}>{formatTime(time)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* DateTimePickers */}
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        display="default"
                        onChange={handleTimeChange}
                    />
                )}
            </ScrollView>

            {/* Continue Button */}
            <View style={styles.footer}>
                <Button
                    title="Continue Setup"
                    onPress={handleContinue}
                    variant="primary"
                    size="large"
                    rightIcon={<Ionicons name="arrow-forward" size={20} color={theme.colors.white} />}
                    style={styles.continueButton}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    header: {
        backgroundColor: theme.colors.white,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },

    backButton: {
        padding: 4,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.dark,
        lineHeight: 28,
    },

    content: {
        flex: 1,
        padding: 20,
    },

    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },

    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },

    toggleButtonActive: {
        backgroundColor: theme.colors.white,
    },

    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },

    toggleTextActive: {
        color: '#2E7D32',
    },

    inputSection: {
        marginBottom: 20,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.dark,
        marginBottom: 8,
    },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        paddingLeft: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    inputIcon: {
        marginRight: 8,
    },

    input: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },

    row: {
        flexDirection: 'row',
        gap: 12,
    },

    halfWidth: {
        flex: 1,
    },

    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    pickerText: {
        fontSize: 15,
        color: theme.colors.dark,
    },

    footer: {
        padding: 20,
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },

    continueButton: {
        backgroundColor: '#1E3A5F',
    },

    // Template styles
    loadTemplateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBF5FF',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        gap: 10,
    },

    loadTemplateText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },

    modalContent: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        paddingBottom: 40,
    },

    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.dark,
    },

    templateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    templateInfo: {
        flex: 1,
    },

    templateName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.dark,
    },

    templateMeta: {
        fontSize: 13,
        color: theme.colors.textTertiary,
        marginTop: 2,
    },

    emptyText: {
        textAlign: 'center',
        color: theme.colors.textTertiary,
        padding: 20,
    },
});

export default CreateMatchScreen;
