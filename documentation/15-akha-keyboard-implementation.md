# Akha Keyboard (Mobile) Implementation Guide

## Overview
The **Akha Keyboard** is a custom React Native component enabling typing in the Akha language with full emoji support. It provides a native-like keyboard experience within the mobile application.

**Component Path:** `apps/mobile/components/akha-keyboard.tsx`
**Emoji Data:** `apps/mobile/data/emoji-data.ts`

## Features

### 1. Akha Tone Bar
Quick access to essential Akha tone characters at the top of the keyboard:
- **Tones:** `ʼ`, `-`, `ˬ`, `ꞈ`, `ˇ`, `ˆ`
- In **Emoji Mode**, this bar transforms into the **Emoji Category Selector**

### 2. Multi-Layout System

| Layout    | Trigger | Description |
|-----------|---------|-------------|
| **Alpha** | Default | QWERTY + Akha Tones |
| **Num**   | `?123`  | Numbers and punctuation |
| **Sym**   | Shift in Num | Special characters |
| **Emoji** | 🙂 icon | Full emoji picker |

### 3. Comprehensive Emoji Support
- **~1,300+ standard emojis** organized in 9 categories
- **Categories:** Smileys, People, Animals, Food, Activities, Travel, Objects, Symbols, Flags
- **Scrollable grid** using optimized FlatList
- **Smooth category transitions** with LayoutAnimation

### 4. Standard Keyboard UX
- **Haptic feedback** on key presses (Medium/Light vibration)
- **Long-press backspace** for continuous deletion
- **Proper emoji deletion** (handles multi-byte characters)
- **iOS-style key styling** with shadows and rounded corners
- **Cursor-aware text editing** (insert/delete at cursor position)

### 5. Smart Shift Logic
- **Tap once:** UPPERCASE
- **Tap again:** lowercase

## Technical Implementation

### State Management
```typescript
type KeyboardLayout = 'alpha' | 'num' | 'sym' | 'emoji';
const [layout, setLayout] = useState<KeyboardLayout>('alpha');
const [emojiCategory, setEmojiCategory] = useState<EmojiCategory>('smileys');
```

### Key Files
| File | Purpose |
|------|---------|
| `akha-keyboard.tsx` | Main keyboard component |
| `emoji-data.ts` | Comprehensive emoji dataset |
| `use-custom-keyboard.ts` | Focus/keyboard management hook |

### Focus Management
Uses `useCustomKeyboard` hook to:
- Suppress system keyboard when Akha keyboard is active
- Maintain cursor visibility
- Handle toggle transitions smoothly

```typescript
const keyboard = useCustomKeyboard();
// In TextInput: {...keyboard.inputProps}
// Toggle: keyboard.toggle()
```

### Cursor-Aware Editing
Uses `useRef` for synchronous cursor tracking to prevent race conditions during fast typing:
```typescript
const selectionRef = useRef({ start: 0, end: 0 });
// Updated immediately on key press, not waiting for React re-render
```

## Usage

```tsx
import { useCustomKeyboard } from '../hooks/use-custom-keyboard';
import { AkhaKeyboard } from '../components/akha-keyboard';

// In component:
const keyboard = useCustomKeyboard();
const [selection, setSelection] = useState({ start: 0, end: 0 });
const selectionRef = useRef({ start: 0, end: 0 });

// TextInput with cursor tracking:
<TextInput
    {...keyboard.inputProps}
    selection={selection}
    onSelectionChange={(e) => {
        setSelection(e.nativeEvent.selection);
        selectionRef.current = e.nativeEvent.selection;
    }}
/>

// Keyboard with cursor-aware handlers:
{keyboard.isVisible && (
    <AkhaKeyboard
        onKeyPress={(key) => {
            const { start, end } = selectionRef.current;
            const newContent = content.slice(0, start) + key + content.slice(end);
            setContent(newContent);
            const newPos = start + key.length;
            setSelection({ start: newPos, end: newPos });
            selectionRef.current = { start: newPos, end: newPos };
        }}
        onDelete={() => { /* Similar cursor-aware logic */ }}
        onInteraction={() => keyboard.inputRef.current?.focus()}
        onSubmit={handleSubmit}
    />
)}
```

## Dependencies
- `expo-haptics` - Vibration feedback
- React Native `LayoutAnimation` - Smooth transitions
- React Native `FlatList` - Optimized emoji grid
