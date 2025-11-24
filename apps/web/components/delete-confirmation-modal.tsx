'use client';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm }: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xs rounded-2xl bg-background p-8 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-2">Delete post?</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="w-full rounded-full bg-destructive px-4 py-3 font-bold text-white hover:opacity-90"
                    >
                        Delete
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full rounded-full border border-border px-4 py-3 font-bold hover:bg-muted/50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
