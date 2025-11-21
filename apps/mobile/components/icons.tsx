import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    filled?: boolean;
}

// Post Interaction Icons
export const HeartIcon = ({ size = 20, color = 'gray', filled = false }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
        <Path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={filled ? color : 'none'}
            stroke={filled ? 'none' : color}
            strokeWidth={filled ? 0 : 2}
        />
    </Svg>
);

export const ReplyIcon = ({ size = 20, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
    </Svg>
);

export const RepostIcon = ({ size = 20, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
    </Svg>
);

export const ViewsIcon = ({ size = 20, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
    </Svg>
);

export const QuoteIcon = ({ size = 18, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <G>
            <Path d="M14.23 2.854c.98-.177 1.762-.825 1.762-1.854h-2.01c0 .49-.22.83-.53.83-.17 0-.36-.04-.5-.1a.99.99 0 0 0-1.12.23c-.2.24-.26.56-.17.85.35 1.14 1.4 1.97 2.578 2.044zM19.5 13c-1.7 0-3.24.49-4.55 1.33L13.6 13H11v9.5h2.55l1.35-1.35c1.31-.84 2.85-1.33 4.55-1.33.49 0 .96.04 1.42.12V10.9c-.46-.08-.93-.12-1.42-.12zM7 13c-1.7 0-3.24.49-4.55 1.33L1.1 13H-1.5v9.5H1.1l1.35-1.35C3.76 20.31 5.3 19.82 7 19.82c.49 0 .96.04 1.42.12V10.9C7.96 10.82 7.49 10.78 7 10.78z" />
            <Path d="M20.5 3H5.5c-1.38 0-2.5 1.12-2.5 2.5v11.33c1.17-.94 2.67-1.51 4.29-1.51 1.63 0 3.13.57 4.3 1.51 1.17-.94 2.67-1.51 4.29-1.51 1.63 0 3.13.57 4.3 1.51V5.5c0-1.38-1.12-2.5-2.5-2.5zm-1.5 9h-2v-2h2v2zm0-4h-2V6h2v2z" />
        </G>
    </Svg>
);

// Navigation Icons
export const HomeIcon = ({ size = 28, color = 'gray', filled = false }: IconProps) => {
    if (filled) {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <Path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z" />
            </Svg>
        );
    }
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <Path d="M12 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm0-13.304L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM19 19.5c0 .276-.224.5-.5.5h-13c-.276 0-.5-.224-.5-.5V8.429l7-4.375 7 4.375V19.5z" />
        </Svg>
    );
};

export const SearchIcon = ({ size = 28, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
    </Svg>
);

export const NotificationsIcon = ({ size = 28, color = 'gray', filled = false }: IconProps) => {
    if (filled) {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <Path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.13-8.949C19.48 5.021 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.524 2-2.829 2s-2.417-.835-2.829-2z" />
            </Svg>
        );
    }
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <Path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z" />
        </Svg>
    );
};

export const ProfileIcon = ({ size = 28, color = 'gray', filled = false }: IconProps) => {
    if (filled) {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
                <Path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z" />
            </Svg>
        );
    }
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <Path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z" />
        </Svg>
    );
};

// Utility Icons
export const ImageIcon = ({ size = 24, color = '#1D9BF0' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
    </Svg>
);

export const CloseIcon = ({ size = 20, color = 'white' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z" />
    </Svg>
);

export const LogoutIcon = ({ size = 20, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M16 13v-2H7V8l-5 4 5 4v-3z" />
        <Path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" />
    </Svg>
);

export const ShareIcon = ({ size = 24, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z" />
        <Path d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z" />
    </Svg>
);

// Sidebar Menu Icons
export const StarIcon = ({ size = 24, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const BookmarkIcon = ({ size = 24, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const ListIcon = ({ size = 24, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const MicIcon = ({ size = 24, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const CashIcon = ({ size = 24, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const SettingsIcon = ({ size = 24, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const ChevronDownIcon = ({ size = 20, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Theme Toggle Icons - Minimalist X Style
export const SunIcon = ({ size = 24, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

export const MoonIcon = ({ size = 24, color = 'gray' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);
