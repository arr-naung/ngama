import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import { DeleteIcon } from '../icons';

interface PostOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
}

export function PostOptionsModal({ visible, onClose, onDelete }: PostOptionsModalProps) {
    const { colorScheme } = useColorScheme();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50 justify-end"
                activeOpacity={1}
                onPress={onClose}
            >
                <View className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 rounded-t-3xl p-6 pb-10">
                    <TouchableOpacity
                        className="flex-row items-center gap-4 py-4"
                        onPress={() => {
                            onClose();
                            onDelete();
                        }}
                    >
                        <DeleteIcon size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                        <Text className="text-black dark:text-white text-xl font-bold">Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="mt-4 bg-gray-200 dark:bg-gray-900 py-3 rounded-full items-center"
                        onPress={onClose}
                    >
                        <Text className="text-black dark:text-white font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
