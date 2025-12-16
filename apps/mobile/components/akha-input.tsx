import React, { useState, useRef, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps, Keyboard, Modal } from 'react-native';
import { useColorScheme } from 'nativewind';
import { AkhaKeyboard } from './akha-keyboard';
import { AkhaIcon } from './icons';

export interface AkhaInputProps extends Omit<TextInputProps, 'ref'> {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit?: () => void;
    showToggleButton?: boolean;
    containerClassName?: string;
    inputClassName?: string;
    renderRight?: React.ReactNode;
    /**
     * The visual style variant of the input.
     * - 'outsideIcon': Flexible layout, icon placed outside (left) of the input. Suitable for Comments/Forms.
     * - 'insideIcon': Fixed layout, icon placed inside a gray background bubble. Suitable for Search bars.
     * @default 'outsideIcon'
     */
    variant?: 'outsideIcon' | 'insideIcon';
    /**
     * Whether to reserve space for the keyboard in the layout when visible.
     * Useful when the input is at the bottom of the screen (like chat) to push content up.
     * @default false
     */
    useKeyboardSpacer?: boolean;
}

export function AkhaInput({
    value,
    onChangeText,
    onSubmit,
    showToggleButton = true,
    containerClassName = '',
    inputClassName = '',
    renderRight,
    variant = 'outsideIcon',
    useKeyboardSpacer = false,
    ...textInputProps
}: AkhaInputProps) {
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

    // Variant Styles Logic
    const isInsideIcon = variant === 'insideIcon';

    // Container Style
    // insideIcon: bg-gray-100 rounded-full h-10 px-4 flex-row items-center
    // outsideIcon: flex-row items-center (allows external flexibility)
    const baseContainerStyle = isInsideIcon
        ? `bg-gray-100 dark:bg-gray-900 rounded-full px-4 h-10 flex-row items-center`
        : `flex-row items-center`;

    // Input Style
    // insideIcon: flex-1 h-full p-0
    // outsideIcon: flex-1 (allows external styling)
    const baseInputStyle = isInsideIcon
        ? `flex-1 text-black dark:text-white text-base h-full p-0`
        : `flex-1 text-black dark:text-white`;

    // Estimated height of the Akha Keyboard
    const KEYBOARD_HEIGHT = 290;

    return (
        <>
            <View className={`${baseContainerStyle} ${containerClassName}`}>
                {/* Toggle Button */}
                {showToggleButton && (
                    <TouchableOpacity
                        onPress={toggleKeyboard}
                        className={isInsideIcon ? "mr-2" : "p-2"}
                    >
                        <AkhaIcon size={24} color={isKeyboardVisible ? '#1D9BF0' : '#9CA3AF'} />
                    </TouchableOpacity>
                )}

                {/* Input Field */}
                <TextInput
                    ref={inputRef}
                    showSoftInputOnFocus={!isKeyboardVisible}
                    className={`${baseInputStyle} ${inputClassName}`}
                    placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                    value={value}
                    onChangeText={onChangeText}
                    onSelectionChange={(e) => { selectionRef.current = e.nativeEvent.selection; }}
                    {...textInputProps}
                />

                {/* Right Content (e.g. Clear button or Reply button) */}
                {renderRight}
            </View>

            {/* Keyboard Spacer (pushes content up when keyboard is visible) */}
            {useKeyboardSpacer && isKeyboardVisible && (
                <View style={{ height: KEYBOARD_HEIGHT }} />
            )}

            {/* Modal Keyboard Overlay */}
            <Modal
                transparent={true}
                visible={isKeyboardVisible}
                animationType="fade"
                onRequestClose={() => setIsKeyboardVisible(false)}
            >
                <TouchableOpacity
                    className="flex-1"
                    activeOpacity={1}
                    onPress={() => setIsKeyboardVisible(false)}
                >
                    <View className="flex-1 justify-end">
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
