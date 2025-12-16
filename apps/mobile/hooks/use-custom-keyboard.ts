import { useState, useRef, useCallback } from 'react';
import { TextInput, Keyboard } from 'react-native';

export function useCustomKeyboard() {
    const [isVisible, setIsVisible] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const toggle = useCallback(() => {
        if (isVisible) {
            // Hiding custom keyboard
            setIsVisible(false);
            // System keyboard will show on next focus naturally
        } else {
            // Showing custom keyboard
            // 1. Dismiss system keyboard
            Keyboard.dismiss();

            // 2. Enable custom keyboard view
            setIsVisible(true);

            // 3. Re-focus input after small delay to ensure cursor is visible
            // The delay allows the native keyboard dismissal animation to start/complete
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [isVisible]);

    const hide = useCallback(() => {
        setIsVisible(false);
    }, []);

    const inputProps = {
        showSoftInputOnFocus: !isVisible,
        // Note: We do NOT dismiss keyboard in onFocus because showSoftInputOnFocus handles it.
        // Calling dismiss() here would blur the input, hiding the cursor.
    };

    return {
        isVisible,
        toggle,
        hide,
        inputRef,
        inputProps
    };
}
