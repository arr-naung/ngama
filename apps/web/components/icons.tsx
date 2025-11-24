export const HeartIcon = ({ filled = false, className = "w-5 h-5" }: { filled?: boolean; className?: string }) => {
    if (filled) {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
                <g>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                </g>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <g>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" strokeWidth="2"></path>
            </g>
        </svg>
    );
};

export const ReplyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
        </g>
    </svg>
);

export const RepostIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
        </g>
    </svg>
);

export const QuoteIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M14.23 2.854c.98-.177 1.762-.825 1.762-1.854h-2.01c0 .49-.22.83-.53.83-.17 0-.36-.04-.5-.1a.99.99 0 0 0-1.12.23c-.2.24-.26.56-.17.85.35 1.14 1.4 1.97 2.578 2.044zM19.5 13c-1.7 0-3.24.49-4.55 1.33L13.6 13H11v9.5h2.55l1.35-1.35c1.31-.84 2.85-1.33 4.55-1.33.49 0 .96.04 1.42.12V10.9c-.46-.08-.93-.12-1.42-.12zM7 13c-1.7 0-3.24.49-4.55 1.33L1.1 13H-1.5v9.5H1.1l1.35-1.35C3.76 20.31 5.3 19.82 7 19.82c.49 0 .96.04 1.42.12V10.9C7.96 10.82 7.49 10.78 7 10.78z"></path>
            <path d="M20.5 3H5.5c-1.38 0-2.5 1.12-2.5 2.5v11.33c1.17-.94 2.67-1.51 4.29-1.51 1.63 0 3.13.57 4.3 1.51 1.17-.94 2.67-1.51 4.29-1.51 1.63 0 3.13.57 4.3 1.51V5.5c0-1.38-1.12-2.5-2.5-2.5zm-1.5 9h-2v-2h2v2zm0-4h-2V6h2v2z"></path>
        </g>
    </svg>
);

export const ViewsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
        </g>
    </svg>
);

// X Logo
export const XLogo = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
    </svg>
);

// Navigation Icons
export const HomeIcon = ({ filled = false, className = "w-7 h-7" }: { filled?: boolean; className?: string }) => {
    if (filled) {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
                <g>
                    <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z"></path>
                </g>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
            <g>
                <path d="M12 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm0-13.304L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM19 19.5c0 .276-.224.5-.5.5h-13c-.276 0-.5-.224-.5-.5V8.429l7-4.375 7 4.375V19.5z"></path>
            </g>
        </svg>
    );
};

export const SearchIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
        </g>
    </svg>
);

export const NotificationsIcon = ({ filled = false, className = "w-7 h-7" }: { filled?: boolean; className?: string }) => {
    if (filled) {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
                <g>
                    <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.13-8.949C19.48 5.021 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.524 2-2.829 2s-2.417-.835-2.829-2z"></path>
                </g>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
            <g>
                <path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z"></path>
            </g>
        </svg>
    );
};

export const ProfileIcon = ({ filled = false, className = "w-7 h-7" }: { filled?: boolean; className?: string }) => {
    if (filled) {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
                <g>
                    <path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z"></path>
                </g>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
            <g>
                <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"></path>
            </g>
        </svg>
    );
};

// Theme Toggle Icons - Ultra Minimalist X Style
export const SunIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"></path>
        </g>
    </svg>
);

export const MoonIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
        </g>
    </svg>
);
export const DeleteIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07z"></path>
        </g>
    </svg>
);
