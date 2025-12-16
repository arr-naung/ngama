import React, { useState, useRef, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps, Keyboard, Modal } from 'react-native';
import { useColorScheme } from 'nativewind';
import { AkhaKeyboard } from './akha-keyboard';
import { AkhaIcon } from './icons';

interface AkhaTextInputProps extends Omit<TextInputProps, 'ref'> {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit?: () => void;
    showToggleButton?: boolean;
    containerClassName?: string;
    inputClassName?: string;
    renderRight?: React.ReactNode;
}

export function AkhaTextInput({
    value,
    onChangeText,
    onSubmit,
    showToggleButton = true,
    containerClassName = '',
    inputClassName = '',
    renderRight,
    ...textInputProps
}: AkhaTextInputProps) {
    const { colorScheme } = useColorScheme();
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const selectionRef = useRef({ start: 0, end: 0 });

    const toggleKeyboard = useCallback(() => {
        if (isKeyboardVisible) {
            setIsKeyboardVisible(false);
        } else {
            Keyboard.dismiss();
            setIsKeyboardVisible(true);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [isKeyboardVisible]);

    const handleKeyPress = useCallback((key: string) => {
        const { start, end } = selectionRef.current;
        const before = value.slice(0, start);
        const after = value.slice(end);
        onChangeText(before + key + after);
        const newPos = start + key.length;
        selectionRef.current = { start: newPos, end: newPos };
    }, [value, onChangeText]);

    const handleDelete = useCallback(() => {
        const { start, end } = selectionRef.current;
        if (start === end && start > 0) {
            const before = value.slice(0, start - 1);
            const after = value.slice(end);
            onChangeText(before + after);
            selectionRef.current = { start: start - 1, end: start - 1 };
        } else if (start !== end) {
            const before = value.slice(0, start);
            const after = value.slice(end);
            onChangeText(before + after);
            selectionRef.current = { start, end: start };
        }
    }, [value, onChangeText]);

    const handleSubmit = useCallback(() => {
        onSubmit?.();
    }, [onSubmit]);

    const handleInteraction = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <>
            <View className={`flex-row items-center ${containerClassName}`}>
                {showToggleButton && (
                    <TouchableOpacity onPress={toggleKeyboard} className="p-2">
                        <AkhaIcon size={24} color={isKeyboardVisible ? '#1D9BF0' : '#9CA3AF'} />
                    </TouchableOpacity>
                )}
                <TextInput
                    ref={inputRef}
                    showSoftInputOnFocus={!isKeyboardVisible}
                    className={`flex-1 text-black dark:text-white ${inputClassName}`}
                    placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                    value={value}
                    onChangeText={onChangeText}
                    onSelectionChange={(e) => { selectionRef.current = e.nativeEvent.selection; }}
                    {...textInputProps}
                />
                {renderRight}
            </View>
            <Modal
                transparent={true}
                visible={isKeyboardVisible}
                animationType="fade"
                onRequestClose={() => setIsKeyboardVisible(false)}
            >
                {/* Invisible touchable area to dismiss keyboard when tapping outside */}
                <TouchableOpacity
                    className="flex-1"
                    activeOpacity={1}
                    onPress={() => setIsKeyboardVisible(false)}
                >
                    <View className="flex-1 justify-end">
                        {/* Stop propagation so tapping keyboard doesn't dismiss it */}
                        <TouchableOpacity activeOpacity={1}>
                            <AkhaKeyboard
                                onKeyPress={handleKeyPress}
                                onDelete={handleDelete}
                                onSubmit={handleSubmit}
                                onInteraction={handleInteraction}
                            />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}
