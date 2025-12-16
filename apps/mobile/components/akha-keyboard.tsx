import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform, FlatList, LayoutAnimation, UIManager } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { EMOJI_CATEGORIES, EmojiCategory, getEmojiCategory } from '../data/emoji-data';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AkhaKeyboardProps {
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    onSubmit: () => void;
    onInteraction?: () => void;
}

export function AkhaKeyboard({ onKeyPress, onDelete, onSubmit, onInteraction }: AkhaKeyboardProps) {
    const { colorScheme } = useColorScheme();
    const [isShifted, setIsShifted] = useState(false);
    const [isCapsLocked, setIsCapsLocked] = useState(false);

    // Long press backspace logic
    // Long press backspace logic
    const deleteTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const onDeleteRef = React.useRef(onDelete);

    useEffect(() => {
        onDeleteRef.current = onDelete;
    }, [onDelete]);

    const handleKeyPress = (key: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onKeyPress(key);
        onInteraction?.();
    };

    const handleDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDelete();
        onInteraction?.();
    };

    const handleLongPressDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onDeleteRef.current(); // Initial delete
        deleteTimerRef.current = setInterval(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDeleteRef.current();
        }, 100);
    };

    const handlePressOutDelete = () => {
        if (deleteTimerRef.current) {
            clearInterval(deleteTimerRef.current);
            deleteTimerRef.current = null;
        }
    };

    const width = Dimensions.get('window').width;
    const keyWidth = (width - 10) / 10; // 10 keys per row
    const keyHeight = 42;
    const keyRadius = 6;

    const TONES = ['ʼ', '-', 'ˬ', 'ꞈ', 'ˇ', 'ˆ'];

    type KeyboardLayout = 'alpha' | 'num' | 'sym' | 'emoji';
    const [layout, setLayout] = useState<KeyboardLayout>('alpha');

    // Standard QWERTY layout
    const ROW_1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
    const ROW_2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
    const ROW_3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

    // Number layout
    const NUM_ROW_1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const NUM_ROW_2 = ['@', '#', '£', '_', '&', '-', '+', '(', ')', '/'];
    const NUM_ROW_3 = ['*', '"', '\'', ':', ';', '!', '?'];

    // Symbol layout
    const SYM_ROW_1 = ['~', '`', '|', '•', '√', 'π', '÷', '×', '§', 'Δ'];
    const SYM_ROW_2 = ['€', '¥', '$', '¢', '^', '°', '=', '{', '}', '\\'];
    const SYM_ROW_3 = ['%', '©', '®', '™', '✓', '[', ']'];

    // Emoji state - use imported data
    const [emojiCategory, setEmojiCategory] = useState<EmojiCategory>('smileys');

    // Get current emojis from imported data
    const currentEmojiData = getEmojiCategory(emojiCategory);
    const currentEmojis = currentEmojiData?.emojis || [];

    const handleShift = () => {
        if (layout === 'alpha') {
            setIsShifted(!isShifted);
        } else if (layout === 'num') {
            setLayout('sym');
        } else if (layout === 'sym') {
            setLayout('num');
        } else if (layout === 'emoji') {
            setLayout('alpha');
        }
    };

    const getKeyLabel = (key: string) => {
        if (layout === 'alpha' && isShifted) return key.toUpperCase();
        return key;
    };

    const renderKey = (key: string, w: number = keyWidth) => (
        <TouchableOpacity
            key={key}
            onPress={() => handleKeyPress(getKeyLabel(key))}
            style={{
                width: w - 5,
                height: keyHeight,
                backgroundColor: colorScheme === 'dark' ? '#3a3a3c' : '#ffffff',
                borderRadius: keyRadius,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 2.5,
                marginVertical: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1,
                elevation: 2,
            }}
        >
            <Text style={{
                color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                fontSize: 22,
                fontWeight: '400',
            }}>
                {getKeyLabel(key)}
            </Text>
        </TouchableOpacity>
    );

    const renderToneKey = (key: string) => (
        <TouchableOpacity
            key={key}
            onPress={() => handleKeyPress(key)}
            style={{
                flex: 1,
                height: 36,
                backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#d1d1d6',
                borderRadius: keyRadius,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 2,
            }}
        >
            <Text style={{
                color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                fontSize: 20,
                fontWeight: '600',
            }}>
                {key}
            </Text>
        </TouchableOpacity>
    );

    const renderCategoryKey = (cat: { id: EmojiCategory, icon: string }) => (
        <TouchableOpacity
            key={cat.id}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Smooth transition animation
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setEmojiCategory(cat.id);
            }}
            className={`rounded-lg justify-center items-center m-0.5 flex-1 ${emojiCategory === cat.id ? 'bg-blue-500' : 'bg-transparent'}`}
            style={{ height: 36 }}
        >
            <Text style={{ fontSize: 22 }}>
                {cat.icon}
            </Text>
        </TouchableOpacity>
    );

    // Emoji render item for FlatList
    const renderEmojiItem = useCallback(({ item, index }: { item: string; index: number }) => (
        <TouchableOpacity
            onPress={() => handleKeyPress(item)}
            className="justify-center items-center"
            style={{ width: (width - 16) / 8, height: 44 }}
        >
            <Text style={{ fontSize: 26 }}>{item}</Text>
        </TouchableOpacity>
    ), [handleKeyPress, width]);


    return (
        <View className="bg-gray-200 dark:bg-gray-900 pb-8 pt-2">
            {/* Tone Bar OR Category Bar */}
            <View className="flex-row px-1 mb-2">
                {layout === 'emoji'
                    ? EMOJI_CATEGORIES.map(cat => renderCategoryKey(cat))
                    : TONES.map(tone => renderToneKey(tone))
                }
            </View>

            {/* Emoji Grid - FlatList for performance */}
            {layout === 'emoji' && (
                <FlatList
                    data={currentEmojis}
                    renderItem={renderEmojiItem}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    numColumns={8}
                    style={{ height: 176 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                    getItemLayout={(data, index) => ({
                        length: 44,
                        offset: 44 * Math.floor(index / 8),
                        index,
                    })}
                />
            )}

            {/* Row 1 - Non-emoji layouts */}
            {layout !== 'emoji' && (
                <View className="flex-row justify-center px-1">
                    {layout === 'alpha' && ROW_1.map(key => renderKey(key))}
                    {layout === 'num' && NUM_ROW_1.map(key => renderKey(key))}
                    {layout === 'sym' && SYM_ROW_1.map(key => renderKey(key))}
                </View>
            )}

            {/* Row 2 - Non-emoji layouts */}
            {layout !== 'emoji' && (
                <View className="flex-row justify-center px-1">
                    {layout === 'alpha' && ROW_2.map(key => renderKey(key))}
                    {layout === 'num' && NUM_ROW_2.map(key => renderKey(key))}
                    {layout === 'sym' && SYM_ROW_2.map(key => renderKey(key))}
                </View>
            )}

            {/* Row 3 - Non-emoji layouts */}
            {layout !== 'emoji' && (
                <View className="flex-row justify-center px-1">
                    <TouchableOpacity
                        onPress={handleShift}
                        className="bg-gray-300 dark:bg-gray-800 rounded-md justify-center items-center m-0.5 shadow-sm"
                        style={{ width: (keyWidth * 1.5) - 4, height: keyHeight }}
                    >
                        <Ionicons
                            name={isShifted || layout === 'sym' ? "arrow-up-circle" : (layout === 'num' ? "arrow-up" : (isShifted ? "arrow-up" : "arrow-up-outline"))}
                            size={24}
                            color={colorScheme === 'dark' ? 'white' : 'black'}
                        />
                    </TouchableOpacity>

                    {layout === 'alpha' && ROW_3.map(key => renderKey(key))}
                    {layout === 'num' && NUM_ROW_3.map(key => renderKey(key))}
                    {layout === 'sym' && SYM_ROW_3.map(key => renderKey(key))}

                    <TouchableOpacity
                        onPress={handleDelete}
                        onLongPress={handleLongPressDelete}
                        onPressOut={handlePressOutDelete}
                        delayLongPress={200}
                        className="bg-gray-300 dark:bg-gray-800 rounded-md justify-center items-center m-0.5 shadow-sm"
                        style={{ width: (keyWidth * 1.5) - 4, height: keyHeight }}
                    >
                        <Ionicons name="backspace-outline" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Row 4 (Space, Enter) */}
            <View className="flex-row justify-center px-1 mt-1">
                <TouchableOpacity
                    onPress={() => setLayout(layout === 'alpha' ? 'num' : 'alpha')}
                    className="bg-gray-300 dark:bg-gray-800 rounded-md justify-center items-center m-0.5 shadow-sm"
                    style={{ width: (keyWidth * 1.5) - 4, height: keyHeight }}
                >
                    <Text className="text-black dark:text-white font-bold text-sm">
                        {layout === 'alpha' ? '?123' : (layout === 'emoji' ? 'ABC' : 'ABC')}
                    </Text>
                </TouchableOpacity>

                {layout !== 'emoji' && (
                    <TouchableOpacity
                        onPress={() => handleKeyPress(layout === 'sym' ? '<' : ',')}
                        className="bg-white dark:bg-gray-700 rounded-md justify-center items-center m-0.5 shadow-sm"
                        style={{ width: keyWidth - 4, height: keyHeight }}
                    >
                        <Text className="text-black dark:text-white font-bold text-xl">
                            {layout === 'sym' ? '<' : ','}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() => setLayout(layout === 'emoji' ? 'alpha' : 'emoji')}
                    className={`rounded-md justify-center items-center m-0.5 shadow-sm ${layout === 'emoji' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-300 dark:bg-gray-800'}`}
                    style={{ width: keyWidth - 4, height: keyHeight }}
                >
                    <Ionicons name="happy-outline" size={24} color={layout === 'emoji' ? '#1D9BF0' : (colorScheme === 'dark' ? 'white' : 'black')} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleKeyPress(' ')}
                    className="bg-white dark:bg-gray-700 rounded-md justify-center items-center m-0.5 shadow-sm"
                    style={{ flex: 1, height: keyHeight }}
                >
                    <Text className="text-black dark:text-white text-sm font-medium">Akha</Text>
                </TouchableOpacity>

                {layout === 'emoji' && (
                    <TouchableOpacity
                        onPress={handleDelete}
                        onLongPress={handleLongPressDelete}
                        onPressOut={handlePressOutDelete}
                        delayLongPress={200}
                        className="bg-gray-300 dark:bg-gray-800 rounded-md justify-center items-center m-0.5 shadow-sm"
                        style={{ width: (keyWidth * 1.5) - 4, height: keyHeight }}
                    >
                        <Ionicons name="backspace-outline" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                    </TouchableOpacity>
                )}

                {layout !== 'emoji' && (
                    <TouchableOpacity
                        onPress={() => handleKeyPress(layout === 'sym' ? '>' : '.')}
                        className="bg-white dark:bg-gray-700 rounded-md justify-center items-center m-0.5 shadow-sm"
                        style={{ width: keyWidth - 4, height: keyHeight }}
                    >
                        <Text className="text-black dark:text-white font-bold text-xl">
                            {layout === 'sym' ? '>' : '.'}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() => handleKeyPress('\n')}
                    className="bg-blue-500 rounded-md justify-center items-center m-0.5 shadow-sm"
                    style={{ width: (keyWidth * 1.5) - 4, height: keyHeight }}
                >
                    <Ionicons name="return-down-back" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View >
    );
}

